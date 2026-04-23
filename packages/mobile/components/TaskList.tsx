import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { api, type ApiTask, type ViewKind } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { readCachedTasks, writeCachedTasks } from "../lib/task-cache";
import { emitTasksChanged, onTasksChanged } from "../lib/events";
import { TaskRow } from "./TaskRow";

interface Props {
  view: ViewKind;
}

export function TaskList({ view }: Props) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);

  const reload = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const list = await api.listTasks(view);
      setTasks(list);
      setStale(false);
      await writeCachedTasks(view, list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
      setStale(true);
    } finally {
      setLoading(false);
    }
  }, [user, view]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await readCachedTasks(view);
      if (!cancelled && cached) {
        setTasks(cached.data);
        setStale(true);
        setLoading(false);
      }
      await reload();
    })();
    return () => {
      cancelled = true;
    };
  }, [view, reload]);

  useEffect(() => onTasksChanged(() => void reload()), [reload]);

  const onToggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (task.status === "OPEN") {
      // optimistic
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "COMPLETED", completedAt: new Date().toISOString() } : t,
        ),
      );
      try {
        await api.completeTask(id);
        emitTasksChanged();
      } catch {
        await reload();
      }
    }
  };

  if (loading) {
    return (
      <View className="py-16 items-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!tasks.length && !error) {
    return (
      <Text className="py-12 text-center text-haru-muted text-sm">
        할 일이 없습니다. 위 빠른 입력으로 추가해 보세요.
      </Text>
    );
  }

  return (
    <View>
      {error && (
        <Text className="text-xs text-red-500 mb-2">
          {error}
          {stale ? " (캐시 표시 중)" : ""}
        </Text>
      )}
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={{
            id: t.id,
            title: t.title,
            when: t.when,
            tags: t.taskTags.map((tt) => tt.tag.name),
          }}
          done={t.status !== "OPEN"}
          onToggle={() => onToggle(t.id)}
        />
      ))}
    </View>
  );
}
