import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from 'recoil';
import {
  completedTaskCountSelector,
  taskIdsState,
  taskState,
  taskSuggestionSelector,
  taskSummarySelector,
} from '../state/tasks';

interface TaskItemProps {
  taskId: string;
}

export function TaskItem({ taskId }: TaskItemProps) {
  const [task, setTask] = useRecoilState(taskState(taskId));
  const summary = useRecoilValue(taskSummarySelector(taskId));
  const suggestion = useRecoilValueLoadable(taskSuggestionSelector(taskId));

  return (
    <li className="task-item">
      <label>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(event) => setTask({ ...task, completed: event.target.checked })}
        />
        <input
          value={task.title}
          placeholder="Task title"
          onChange={(event) => setTask({ ...task, title: event.target.value })}
        />
      </label>
      <p className="summary">{summary}</p>
      <p className="suggestion">
        {suggestion.state === 'loading' && 'Loading suggestion...'}
        {suggestion.state === 'hasValue' && `Async suggestion: ${suggestion.contents}`}
        {suggestion.state === 'hasError' && 'Suggestion failed'}
      </p>
    </li>
  );
}

interface TaskListProps {
  taskIds: string[];
}

export function TaskList({ taskIds }: TaskListProps) {
  return (
    <ul className="task-list">
      {taskIds.map((taskId) => (
        <TaskItem key={taskId} taskId={taskId} />
      ))}
    </ul>
  );
}

export function TaskDashboard() {
  const [taskIds, setTaskIds] = useRecoilState(taskIdsState('all'));
  const completedCount = useRecoilValue(completedTaskCountSelector);

  const addTask = () => {
    const id = crypto.randomUUID();
    setTaskIds([...taskIds, id]);
  };

  return (
    <section>
      <header className="dashboard-header">
        <h2>Task board</h2>
        <p>
          Completed: {completedCount} / {taskIds.length}
        </p>
        <button type="button" onClick={addTask}>
          Add task
        </button>
      </header>
      <TaskList taskIds={taskIds} />
    </section>
  );
}
