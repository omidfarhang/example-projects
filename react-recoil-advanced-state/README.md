# React Recoil Advanced State

Companion project for [Advanced State Management in React with Recoil](https://omid.dev/2024/06/14/advanced-state-management-in-react-with-recoil/).

**Live demo:** https://playground.omid.dev/examples/react-recoil-advanced-state/ (prebuilt on [playground.omid.dev](https://playground.omid.dev))

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Concepts mapped to code

| Blog concept | Code location |
|--------------|---------------|
| Atom families | `src/state/tasks.ts` — `taskState`, `taskIdsState` |
| Selectors | `completedTaskCountSelector`, `taskSummarySelector` |
| Async selectors | `taskSuggestionSelector` |
| UI usage | `src/components/TaskDashboard.tsx` |

## Blog post

https://omid.dev/2024/06/14/advanced-state-management-in-react-with-recoil/
