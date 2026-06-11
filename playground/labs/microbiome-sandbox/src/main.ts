import './style.css';
import { App } from './app/App';

const mount = document.getElementById('app');
if (mount) {
  new App(mount);
}
