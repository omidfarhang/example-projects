import { RecoilRoot } from 'recoil';
import { TaskDashboard } from './components/TaskDashboard';
import './App.css';

function App() {
  return (
    <RecoilRoot>
      <main className="app">
        <h1>Recoil Advanced State</h1>
        <p>Atom families, selectors, and async selectors from the omid.dev tutorial.</p>
        <TaskDashboard />
      </main>
    </RecoilRoot>
  );
}

export default App;
