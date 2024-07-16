import React from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import App from './App';
import './index.css';

const AppElement = reactToWebComponent(App, React, ReactDOM);
customElements.define('react-element', AppElement);
