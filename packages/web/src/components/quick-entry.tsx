"use client";
import { useState } from "react";
import { parseKoreanEntry } from "@haru/shared/korean-date";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function QuickEntry() {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = value.trim() ? parseKoreanEntry(value) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = value.trim();
    if (!raw || submitting) return;
    if (!user) {
      setError("로그인 후 저장할 수 있습니다");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.quickEntry(raw);
      setValue("");
      window.dispatchEvent(new CustomEvent("haru:tasks-changed"));
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-8">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='무엇을 하실 건가요?  예: "내일 오후 3시 팀 회의 #회의 !"'
          disabled={submitting}
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-[15px] outline-none focus:border-haru-accent transition-colors disabled:opacity-50"
        />
      </div>
      {preview && (
        <div className="mt-2 px-4 py-2 text-xs text-haru-muted bg-black/[.02] dark:bg-white/[.03] rounded-lg flex flex-wrap gap-3">
          <span>📝 {preview.title}</span>
          {preview.when && <span>📅 {new Date(preview.when).toLocaleString("ko-KR")}</span>}
          {preview.deadline && <span>⏰ 마감: {new Date(preview.deadline).toLocaleString("ko-KR")}</span>}
          {preview.priority > 0 && <span>❗{"!".repeat(preview.priority)}</span>}
          {preview.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
          <span className="ml-auto text-haru-muted/70">Enter로 저장</span>
        </div>
      )}
      {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
    </form>
  );
}
