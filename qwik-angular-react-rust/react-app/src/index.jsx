import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReactMicroFrontend } from './ReactMicroFrontend.jsx';
import './style.css';

class ReactMicroFrontendElement extends HTMLElement {
  static get observedAttributes() {
    return ['message'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.root?.unmount();
  }

  render() {
    this.root ??= createRoot(this);
    this.root.render(
      <ReactMicroFrontend message={this.getAttribute('message') ?? ''} />,
    );
  }
}

if (!customElements.get('react-microfrontend')) {
  customElements.define('react-microfrontend', ReactMicroFrontendElement);
}
