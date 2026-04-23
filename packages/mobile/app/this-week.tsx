import { Screen } from "../components/Screen";
import { QuickEntry } from "../components/QuickEntry";
import { TaskList } from "../components/TaskList";

export default function ThisWeekScreen() {
  return (
    <Screen title="이번주" subtitle="한국 직장인 선호 뷰 · 월~일">
      <QuickEntry />
      <TaskList view="thisWeek" />
    </Screen>
  );
}
