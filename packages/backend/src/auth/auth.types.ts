export interface AuthUser {
  id: string;
  email: string | null;
  nickname: string;
}

export interface JwtPayload {
  sub: string;
  email: string | null;
  nickname: string;
  /** 토큰 종류 */
  typ: "access" | "refresh";
  /** 세션 식별자 — 로그아웃 시 무효화 */
  sid: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
