import { Injectable, Logger } from "@nestjs/common";
import { DevicePlatform } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface RegisterDeviceInput {
  token: string;
  platform: "ios" | "android" | "web";
  deviceLabel?: string;
}

export interface UpdatePreferencesInput {
  push?: boolean;
  kakaoAlimtalk?: boolean;
  quietStart?: string;
  quietEnd?: string;
  dailyDigest?: boolean;
  digestHour?: number;
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * v1 스캐폴드. 실 송신은 FCM/APNs 연동 시 구현.
 * 현재는 device 등록·환경설정·큐잉만 담당.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerDevice(userId: string, input: RegisterDeviceInput) {
    const platform = input.platform.toUpperCase() as keyof typeof DevicePlatform;
    await this.prisma.pushDevice.upsert({
      where: { token: input.token },
      update: {
        userId,
        platform: DevicePlatform[platform],
        deviceLabel: input.deviceLabel,
        lastSeenAt: new Date(),
      },
      create: {
        userId,
        token: input.token,
        platform: DevicePlatform[platform],
        deviceLabel: input.deviceLabel,
      },
    });
    return { ok: true as const };
  }

  async unregisterDevice(userId: string, token: string) {
    await this.prisma.pushDevice.deleteMany({ where: { userId, token } });
    return { ok: true as const };
  }

  async getPreferences(userId: string) {
    const pref = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (pref) return pref;
    return this.prisma.notificationPreference.create({ data: { userId } });
  }

  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: input,
      create: { userId, ...input },
    });
  }

  /**
   * 푸시 발송 — 현재는 로그만. 조용한 시간(quietStart~quietEnd) 필터 포함.
   * FCM/APNs 크리덴셜 주입 후 실제 전송 로직 붙일 예정.
   */
  async sendPush(userId: string, payload: PushPayload): Promise<{ queued: number }> {
    const pref = await this.getPreferences(userId);
    if (!pref.push) return { queued: 0 };
    if (this.isWithinQuietHours(pref.quietStart, pref.quietEnd, new Date())) {
      this.logger.debug(`quiet hours, suppressing push to ${userId}`);
      return { queued: 0 };
    }
    const devices = await this.prisma.pushDevice.findMany({ where: { userId } });
    for (const device of devices) {
      this.logger.log(
        `[stub-push] ${device.platform} ${device.token.slice(0, 8)}… · ${payload.title}`,
      );
    }
    return { queued: devices.length };
  }

  private isWithinQuietHours(start: string, end: string, now: Date): boolean {
    const current = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = start.split(":").map((n) => parseInt(n, 10));
    const [eh, em] = end.split(":").map((n) => parseInt(n, 10));
    if ([sh, sm, eh, em].some((v) => Number.isNaN(v))) return false;
    const startMin = sh! * 60 + sm!;
    const endMin = eh! * 60 + em!;
    // 자정을 넘기는 구간 (예: 22:00 ~ 07:00)
    if (startMin > endMin) return current >= startMin || current < endMin;
    return current >= startMin && current < endMin;
  }
}
