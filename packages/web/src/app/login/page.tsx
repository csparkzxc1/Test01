"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.login(email, password);
      await refresh();
      router.push("/today");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("로그인 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-20">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">로그인</h1>
      <p className="text-sm text-haru-muted mb-8">하루로 오늘을 정돈해 보세요.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          autoComplete="email"
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-[15px] outline-none focus:border-haru-accent"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (8자 이상)"
          autoComplete="current-password"
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-[15px] outline-none focus:border-haru-accent"
        />
        {error && <div className="text-xs text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-haru-accent text-white py-3 text-[15px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "로그인 중…" : "로그인"}
        </button>
      </form>
      <div className="mt-6 text-sm text-haru-muted text-center">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-haru-accent hover:underline">
          가입하기
        </Link>
      </div>
    </div>
  );
}
