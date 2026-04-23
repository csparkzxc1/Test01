"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";
const ACCESS_KEY = "haru.access";
const REFRESH_KEY = "haru.refresh";

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

export type ViewKind = "inbox" | "today" | "thisWeek" | "upcoming" | "anytime" | "someday" | "logbook";

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(tokens: AuthTokens) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
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
    const token = getAccessToken();
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

let refreshInFlight: Promise<AuthTokens | null> | null = null;

async function tryRefresh(): Promise<AuthTokens | null> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const tokens = (await res.json()) as AuthTokens;
      saveTokens(tokens);
      return tokens;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
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
    saveTokens(res.tokens);
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    saveTokens(res.tokens);
    return res;
  },

  async me(): Promise<AuthUser> {
    return request<AuthUser>("/auth/me");
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken() ?? undefined;
    try {
      await request<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      clearTokens();
    }
  },

  listTasks(view: ViewKind): Promise<ApiTask[]> {
    const q = new URLSearchParams({ view });
    return request<ApiTask[]>(`/tasks?${q.toString()}`);
  },

  completeTask(id: string): Promise<ApiTask> {
    return request<ApiTask>(`/tasks/${id}/complete`, { method: "POST" });
  },

  deleteTask(id: string): Promise<void> {
    return request<void>(`/tasks/${id}`, { method: "DELETE" });
  },

  quickEntry(raw: string): Promise<ApiTask> {
    return request<ApiTask>("/quick-entry", {
      method: "POST",
      body: JSON.stringify({ raw }),
    });
  },

  quickEntryPreview(raw: string) {
    return request<{
      title: string;
      when: string | null;
      deadline: string | null;
      tags: string[];
      priority: number;
      allDay: boolean;
    }>("/quick-entry/preview", {
      method: "POST",
      body: JSON.stringify({ raw }),
      auth: false,
    });
  },
};
