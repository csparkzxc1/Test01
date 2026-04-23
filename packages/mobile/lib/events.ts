import { DeviceEventEmitter } from "react-native";

export const TASKS_CHANGED = "haru:tasks-changed";

export function emitTasksChanged() {
  DeviceEventEmitter.emit(TASKS_CHANGED);
}

export function onTasksChanged(handler: () => void): () => void {
  const sub = DeviceEventEmitter.addListener(TASKS_CHANGED, handler);
  return () => sub.remove();
}
