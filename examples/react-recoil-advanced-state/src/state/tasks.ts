import { atomFamily, selector, selectorFamily } from 'recoil';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export const taskIdsState = atomFamily<string[], string>({
  key: 'taskIdsState',
  default: ['task-1', 'task-2'],
});

export const taskState = atomFamily<Task, string>({
  key: 'taskState',
  default: (taskId) => ({
    id: taskId,
    title:
      taskId === 'task-1'
        ? 'Review Recoil atom families'
        : taskId === 'task-2'
          ? 'Wire up async selector'
          : '',
    completed: taskId === 'task-1',
  }),
});

export const completedTaskCountSelector = selector({
  key: 'completedTaskCountSelector',
  get: ({ get }) => {
    const ids = get(taskIdsState('all'));
    return ids.filter((id) => get(taskState(id)).completed).length;
  },
});

export const taskSummarySelector = selectorFamily({
  key: 'taskSummarySelector',
  get:
    (taskId: string) =>
    ({ get }) => {
      const task = get(taskState(taskId));
      return `${task.completed ? 'Done' : 'Open'}: ${task.title || '(untitled)'}`;
    },
});

export async function fetchTaskSuggestion(taskId: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return `Suggested title for ${taskId}`;
}

export const taskSuggestionSelector = selectorFamily({
  key: 'taskSuggestionSelector',
  get: (taskId: string) => () => fetchTaskSuggestion(taskId),
});
