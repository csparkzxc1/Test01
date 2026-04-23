"use client";
import { useEffect, useState, useCallback } from "react";
import clsx from "clsx";
import { api, type ApiTask, type ViewKind } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export interface TaskItem {
  id: string;
  title: string;
  when?: string | null;
  deadline?: string | null;
  tags?: string[];
  completed?: boolean;
}

interface Props {
  /** 로그인 후 실 데이터를 받을 뷰 */
  view?: ViewKind;
  /** 로그인 전/샘플 모드 */
  initial?: TaskItem[];
}

export function TaskList({ view, initial }: Props) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>(initial ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!view || !user) return;
    setLoading(true);
    setError(null);
    try {
      const list = await api.listTasks(view);
      setTasks(list.map(fromApi));
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [view, user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const h = () => void reload();
    window.addEventListener("haru:tasks-changed", h);
    return () => window.removeEventListener("haru:tasks-changed", h);
  }, [reload]);

  const toggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    // optimistic
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    if (user && view) {
      try {
        if (!task.completed) await api.completeTask(id);
        // 완료 취소 엔드포인트는 v1에 없으므로 새로고침
        if (task.completed) await reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : "완료 실패");
        await reload();
      }
    }
  };

  if (loading && tasks.length === 0) {
    return <div className="text-haru-muted text-sm py-12 text-center">불러오는 중…</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm py-6">{error}</div>;
  }

  if (!tasks.length) {
    return (
      <div className="text-haru-muted text-sm py-12 text-center">
        할 일이 없습니다. 위 빠른 입력으로 새 할 일을 추가해 보세요.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-black/5 dark:divide-white/10">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-3 py-3">
          <button
            aria-label={task.completed ? "완료 취소" : "완료"}
            onClick={() => toggle(task.id)}
            className={clsx(
              "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
              task.completed
                ? "bg-haru-accent border-haru-accent text-white"
                : "border-haru-muted/50 hover:border-haru-accent",
            )}
          >
            {task.completed ? "✓" : ""}
          </button>
          <div className="flex-1">
            <div
              className={clsx(
                "text-[15px]",
                task.completed && "line-through text-haru-muted",
              )}
            >
              {task.title}
            </div>
            {(task.when || task.deadline || task.tags?.length) && (
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-haru-muted">
                {task.when && <span>📅 {formatKst(task.when)}</span>}
                {task.deadline && <span>⏰ 마감 {formatKst(task.deadline)}</span>}
                {task.tags?.map((t) => (
                  <span key={t} className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function fromApi(t: ApiTask): TaskItem {
  return {
    id: t.id,
    title: t.title,
    when: t.when,
    deadline: t.deadline,
    tags: t.taskTags.map((tt) => tt.tag.name),
    completed: t.status !== "OPEN",
  };
}

function formatKst(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(d);
}
