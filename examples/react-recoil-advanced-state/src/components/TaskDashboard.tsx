import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from 'recoil';
import {
  completedTaskCountSelector,
  taskIdsState,
  taskState,
  taskSuggestionSelector,
  taskSummarySelector,
} from '../state/tasks';
import './TaskDashboard.css';

interface TaskItemProps {
  taskId: string;
}

export function TaskItem({ taskId }: TaskItemProps) {
  const [task, setTask] = useRecoilState(taskState(taskId));
  const summary = useRecoilValue(taskSummarySelector(taskId));
  const suggestion = useRecoilValueLoadable(taskSuggestionSelector(taskId));

  return (
    <li className="task-item">
      <div className="task-item__top">
        <label className="task-item__label">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(event) => setTask({ ...task, completed: event.target.checked })}
          />
          <input
            className="task-item__input"
            value={task.title}
            placeholder="Task title"
            onChange={(event) => setTask({ ...task, title: event.target.value })}
          />
        </label>
        <span className={`status-badge ${task.completed ? 'status-badge--done' : ''}`}>
          {task.completed ? 'Done' : 'Open'}
        </span>
      </div>

      <div className="task-item__derived">
        <div className="derived-row">
          <span className="derived-row__tag">selectorFamily</span>
          <span className="derived-row__value">{summary}</span>
        </div>
        <div className="derived-row">
          <span className="derived-row__tag derived-row__tag--async">async</span>
          {suggestion.state === 'loading' && (
            <span className="derived-row__value derived-row__value--loading">
              Loading suggestion…
            </span>
          )}
          {suggestion.state === 'hasValue' && (
            <span className="derived-row__value">{suggestion.contents}</span>
          )}
          {suggestion.state === 'hasError' && (
            <span className="derived-row__value derived-row__value--error">
              Suggestion failed
            </span>
          )}
        </div>
      </div>
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
    <section className="panel panel--playground">
      <div className="panel-heading">
        <div>
          <p className="eyebrow eyebrow--playground">Live playground</p>
          <h2>Task board</h2>
        </div>
        <span className="status-badge status-badge--count">
          {completedCount} / {taskIds.length} complete
        </span>
      </div>

      <dl className="stat-grid">
        <div className="stat-grid__item">
          <dt>Atom family</dt>
          <dd>taskState(id)</dd>
        </div>
        <div className="stat-grid__item">
          <dt>Selector</dt>
          <dd>completedTaskCountSelector</dd>
        </div>
        <div className="stat-grid__item">
          <dt>Tasks in list</dt>
          <dd>{taskIds.length}</dd>
        </div>
      </dl>

      <TaskList taskIds={taskIds} />

      <button type="button" className="btn" onClick={addTask}>
        Add task
      </button>
    </section>
  );
}
