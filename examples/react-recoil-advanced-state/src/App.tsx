import { RecoilRoot } from 'recoil';
import { TaskDashboard } from './components/TaskDashboard';
import './App.css';

function App() {
  return (
    <RecoilRoot>
      <main className="demo">
        <header className="hero">
          <p className="eyebrow">React + Recoil</p>
          <h1>Advanced state with atom families &amp; selectors</h1>
          <p className="lede">
            A task board powered by Recoil primitives from the companion blog post —
            parameterized atoms, derived selectors, and an async selector with
            loadable state.
          </p>
        </header>

        <section className="panel panel--architecture">
          <h2>How Recoil wires the UI</h2>
          <ol className="flow-list">
            <li className="flow-step flow-step--root">
              <span className="flow-step__label">Root provider</span>
              <strong>RecoilRoot</strong>
              <span className="flow-step__detail">
                Holds the global Recoil store for every hook below
              </span>
            </li>
            <li className="flow-step flow-step--atom">
              <span className="flow-step__label">Atom families</span>
              <strong>taskIdsState · taskState(id)</strong>
              <span className="flow-step__detail">
                One atom per task ID — add a row without touching unrelated state
              </span>
            </li>
            <li className="flow-step flow-step--selector">
              <span className="flow-step__label">Selectors</span>
              <strong>completedTaskCountSelector · taskSummarySelector</strong>
              <span className="flow-step__detail">
                Derived, memoized reads that recompute when upstream atoms change
              </span>
            </li>
            <li className="flow-step flow-step--async">
              <span className="flow-step__label">Async selector</span>
              <strong>taskSuggestionSelector</strong>
              <span className="flow-step__detail">
                Returns a promise — consumed via <code>useRecoilValueLoadable</code>
              </span>
            </li>
          </ol>
        </section>

        <section className="panel panel--concepts">
          <h2>Concepts in this demo</h2>
          <div className="concept-grid">
            <div className="concept-card">
              <span className="concept-card__type">atomFamily</span>
              <code>taskState(taskId)</code>
              <span className="concept-card__hook">useRecoilState</span>
            </div>
            <div className="concept-card">
              <span className="concept-card__type">selector</span>
              <code>completedTaskCountSelector</code>
              <span className="concept-card__hook">useRecoilValue</span>
            </div>
            <div className="concept-card">
              <span className="concept-card__type">selectorFamily</span>
              <code>taskSummarySelector(id)</code>
              <span className="concept-card__hook">useRecoilValue</span>
            </div>
            <div className="concept-card">
              <span className="concept-card__type">async selectorFamily</span>
              <code>taskSuggestionSelector(id)</code>
              <span className="concept-card__hook">useRecoilValueLoadable</span>
            </div>
          </div>
        </section>

        <TaskDashboard />

        <p className="note">
          <strong>Try this:</strong> toggle a checkbox or edit a title — the sync
          summary updates immediately. The async suggestion resolves after ~400ms and
          shows loading state in between.
        </p>
      </main>
    </RecoilRoot>
  );
}

export default App;
