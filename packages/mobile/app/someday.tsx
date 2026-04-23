import { Screen } from "../components/Screen";
import { TaskList } from "../components/TaskList";

export default function SomedayScreen() {
  return (
    <Screen title="언젠가" subtitle="보류 · 영감 보관함">
      <TaskList view="someday" />
    </Screen>
  );
}
