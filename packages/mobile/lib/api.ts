import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_BASE =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_BASE) ??
  "http://localhost:3001/api";
const ACCESS_KEY = "haru.access";
const REFRESH_KEY = "haru.refresh";

export const API_BASE = DEFAULT_BASE;

export interface AuthUser {
  id: string;
  email: string | null;
  nickname: string;
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

export interface ApiTask {
  id: string;
  title: string;
  notes: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELED";
  when: string | null;
  deadline: string | null;
  allDay: boolean;
  projectId: string | null;
  areaId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  checklistItems: { id: string; title: string; done: boolean; sortOrder: number }[];
  taskTags: { tag: { id: string; name: string; colorHex: string | null } }[];
}

export type ViewKind =
  | "inbox"
  | "today"
  | "thisWeek"
  | "upcoming"
  | "anytime"
  | "someday"
  | "logbook";

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_KEY, tokens.accessToken],
    [REFRESH_KEY, tokens.refreshToken],
  ]);
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}

let refreshInFlight: Promise<AuthTokens | null> | null = null;

async function tryRefresh(): Promise<AuthTokens | null> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        await clearTokens();
        return null;
      }
      const tokens = (await res.json()) as AuthTokens;
      await saveTokens(tokens);
      return tokens;
    } catch {
      await clearTokens();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = init;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...((headers as Record<string, string>) ?? {}),
  };
  if (auth) {
    const token = await getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });

  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      finalHeaders.Authorization = `Bearer ${refreshed.accessToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });
    }
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    const msg = (body as { message?: string })?.message ?? res.statusText;
    throw new ApiError(res.status, msg, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  async register(input: {
    email: string;
    password: string;
    nickname: string;
    privacyAgreed: boolean;
    termsAgreed: boolean;
    marketingOptIn?: boolean;
  }): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
      auth: false,
    });
    await saveTokens(res.tokens);
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    await saveTokens(res.tokens);
    return res;
  },

  async loginWithKakao(accessToken: string, consents?: { privacyAgreed: boolean; termsAgreed: boolean; marketingOptIn?: boolean }) {
    const res = await request<AuthResponse>("/auth/kakao", {
      method: "POST",
      body: JSON.stringify({ accessToken, ...consents }),
      auth: false,
    });
    await saveTokens(res.tokens);
    return res;
  },

  async me(): Promise<AuthUser> {
    return request<AuthUser>("/auth/me");
  },

  async logout(): Promise<void> {
    const refreshToken = (await getRefreshToken()) ?? undefined;
    try {
      await request<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      await clearTokens();
    }
  },

  listTasks(view: ViewKind): Promise<ApiTask[]> {
    const q = new URLSearchParams({ view });
    return request<ApiTask[]>(`/tasks?${q.toString()}`);
  },

  completeTask(id: string): Promise<ApiTask> {
    return request<ApiTask>(`/tasks/${id}/complete`, { method: "POST" });
  },

  quickEntry(raw: string): Promise<ApiTask> {
    return request<ApiTask>("/quick-entry", {
      method: "POST",
      body: JSON.stringify({ raw }),
    });
  },

  registerPushToken(input: {
    token: string;
    platform: "ios" | "android" | "web";
    deviceLabel?: string;
  }) {
    return request<{ ok: true }>("/notifications/devices", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
