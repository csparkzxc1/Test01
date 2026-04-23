import { Screen } from "../components/Screen";
import { QuickEntry } from "../components/QuickEntry";
import { TaskList } from "../components/TaskList";
import { isHoliday } from "@haru/shared";

export default function TodayScreen() {
  const now = new Date();
  const holiday = isHoliday(now);
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);

  return (
    <Screen
      title="오늘"
      subtitle={holiday ? `${dateLabel} · ${holiday.name}` : dateLabel}
    >
      <QuickEntry />
      <TaskList view="today" />
    </Screen>
  );
}
