import { component$ } from "@builder.io/qwik";

import '../custom-elements/index.js';

export default component$(() => {
  return (
    <div>
      <h1>Qwik Micro-Frontend</h1>
      <angular-element></angular-element>
      <react-element></react-element>
    </div>
  );
});