"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAgreed || !termsAgreed) {
      setError("필수 약관에 동의해 주세요");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.register({ email, password, nickname, privacyAgreed, termsAgreed, marketingOptIn });
      await refresh();
      router.push("/today");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("가입 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">회원가입</h1>
      <p className="text-sm text-haru-muted mb-8">한 줄 할 일로 오늘을 시작해요.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="text"
          required
          minLength={1}
          maxLength={40}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-[15px] outline-none focus:border-haru-accent"
        />
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
          autoComplete="new-password"
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-[15px] outline-none focus:border-haru-accent"
        />
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <Link href="/legal/terms" className="underline">이용약관</Link>에 동의합니다 <span className="text-red-500">*</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={privacyAgreed}
            onChange={(e) => setPrivacyAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <Link href="/legal/privacy" className="underline">개인정보 처리방침</Link>에 동의합니다 <span className="text-red-500">*</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-haru-muted">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="mt-0.5"
          />
          <span>마케팅 정보 수신 (선택)</span>
        </label>
        {error && <div className="text-xs text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-haru-accent text-white py-3 text-[15px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "가입 중…" : "가입하고 시작하기"}
        </button>
      </form>
      <div className="mt-6 text-sm text-haru-muted text-center">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-haru-accent hover:underline">
          로그인
        </Link>
      </div>
    </div>
  );
}
