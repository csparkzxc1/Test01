import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomUUID } from "node:crypto";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthResponse, AuthTokens, AuthUser, JwtPayload } from "./auth.types";
import type { KakaoLoginDto, LoginDto, RegisterDto } from "./auth.dto";

const BCRYPT_ROUNDS = 12;
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 14 * 24 * 60 * 60 * 1000;

interface KakaoProfile {
  id: number | string;
  kakao_account?: {
    email?: string;
    profile?: { nickname?: string; profile_image_url?: string };
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (!dto.privacyAgreed || !dto.termsAgreed) {
      throw new BadRequestException("개인정보·약관 동의가 필요합니다");
    }
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("이미 가입된 이메일입니다");

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const now = new Date();
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        nickname: dto.nickname,
        privacyAgreedAt: now,
        termsAgreedAt: now,
        marketingOptIn: dto.marketingOptIn ?? false,
        marketingOptInAt: dto.marketingOptIn ? now : null,
        socials: { create: { provider: "EMAIL", providerId: dto.email } },
      },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.nickname);
    return { user: toAuthUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash || user.deletedAt) {
      throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다");
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다");

    const tokens = await this.issueTokens(user.id, user.email, user.nickname);
    return { user: toAuthUser(user), tokens };
  }

  async loginWithKakao(dto: KakaoLoginDto): Promise<AuthResponse> {
    const profile = await this.fetchKakaoProfile(dto.accessToken);
    const providerId = String(profile.id);
    const email = profile.kakao_account?.email ?? null;
    const nickname = profile.kakao_account?.profile?.nickname ?? `카카오_${providerId.slice(-4)}`;

    const existing = await this.prisma.socialAccount.findUnique({
      where: { provider_providerId: { provider: "KAKAO", providerId } },
      include: { user: true },
    });

    let userId: string;
    let user;
    if (existing) {
      user = existing.user;
      userId = user.id;
    } else {
      if (!dto.privacyAgreed || !dto.termsAgreed) {
        throw new BadRequestException("최초 로그인 시 개인정보·약관 동의가 필요합니다");
      }
      const now = new Date();
      user = await this.prisma.user.create({
        data: {
          email,
          nickname,
          privacyAgreedAt: now,
          termsAgreedAt: now,
          marketingOptIn: dto.marketingOptIn ?? false,
          marketingOptInAt: dto.marketingOptIn ? now : null,
          avatarUrl: profile.kakao_account?.profile?.profile_image_url ?? null,
          socials: { create: { provider: "KAKAO", providerId } },
        },
      });
      userId = user.id;
    }

    const tokens = await this.issueTokens(userId, user.email, user.nickname);
    return { user: toAuthUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get("JWT_REFRESH_SECRET") ?? "dev-refresh-secret",
      });
    } catch {
      throw new UnauthorizedException("invalid refresh token");
    }
    if (payload.typ !== "refresh") throw new UnauthorizedException("invalid token type");

    const session = await this.prisma.session.findUnique({ where: { id: payload.sid } });
    if (!session || session.revokedAt) throw new UnauthorizedException("session revoked");
    if (session.expiresAt.getTime() < Date.now()) throw new UnauthorizedException("session expired");

    const providedHash = hashToken(refreshToken);
    if (providedHash !== session.refreshHash) {
      // 재사용 감지 시 해당 세션 무효화 (토큰 탈취 방어)
      await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      throw new UnauthorizedException("refresh token reuse detected");
    }

    // 로테이션: 기존 세션 폐기 + 새 세션 발급
    await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(payload.sub, payload.email, payload.nickname);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      await this.prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return;
    }
    const hash = hashToken(refreshToken);
    await this.prisma.session.updateMany({
      where: { userId, refreshHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new UnauthorizedException();
    return toAuthUser(user);
  }

  private async issueTokens(
    userId: string,
    email: string | null,
    nickname: string,
  ): Promise<AuthTokens> {
    const sid = randomUUID();
    const basePayload: Omit<JwtPayload, "typ"> = { sub: userId, email, nickname, sid };

    const accessToken = await this.jwt.signAsync(
      { ...basePayload, typ: "access" },
      {
        secret: this.config.get("JWT_ACCESS_SECRET") ?? "dev-access-secret",
        expiresIn: ACCESS_TTL_SECONDS,
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { ...basePayload, typ: "refresh" },
      {
        secret: this.config.get("JWT_REFRESH_SECRET") ?? "dev-refresh-secret",
        expiresIn: Math.floor(REFRESH_TTL_MS / 1000),
      },
    );

    await this.prisma.session.create({
      data: {
        id: sid,
        userId,
        refreshHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SECONDS };
  }

  private async fetchKakaoProfile(accessToken: string): Promise<KakaoProfile> {
    const res = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new UnauthorizedException("kakao token verification failed");
    return (await res.json()) as KakaoProfile;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function toAuthUser(user: { id: string; email: string | null; nickname: string }): AuthUser {
  return { id: user.id, email: user.email, nickname: user.nickname };
}
