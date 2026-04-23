import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ApiTask, ViewKind } from "./api";

const KEY_PREFIX = "haru.cache.tasks.";

interface CacheEntry {
  data: ApiTask[];
  cachedAt: string;
}

export async function readCachedTasks(view: ViewKind): Promise<CacheEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + view);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

export async function writeCachedTasks(view: ViewKind, data: ApiTask[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEY_PREFIX + view,
      JSON.stringify({ data, cachedAt: new Date().toISOString() }),
    );
  } catch {
    /* ignore — cache is best-effort */
  }
}

export async function clearTaskCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const targets = keys.filter((k) => k.startsWith(KEY_PREFIX));
  if (targets.length) await AsyncStorage.multiRemove(targets);
}
