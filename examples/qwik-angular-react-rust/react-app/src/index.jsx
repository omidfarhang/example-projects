import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReactMicroFrontend } from './ReactMicroFrontend.jsx';
import styles from './style.css?inline';

class ReactMicroFrontendElement extends HTMLElement {
  static get observedAttributes() {
    return ['message'];
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = styles;
      shadow.append(style);
      this.mountPoint = document.createElement('div');
      shadow.append(this.mountPoint);
    }

    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.root?.unmount();
  }

  render() {
    if (!this.mountPoint) {
      return;
    }

    this.root ??= createRoot(this.mountPoint);
    this.root.render(
      <ReactMicroFrontend message={this.getAttribute('message') ?? ''} />,
    );
  }
}

if (!customElements.get('react-microfrontend')) {
  customElements.define('react-microfrontend', ReactMicroFrontendElement);
}
