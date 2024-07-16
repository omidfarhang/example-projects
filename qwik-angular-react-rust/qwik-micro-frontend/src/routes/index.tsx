import { component$, useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
  useVisibleTask$(() => {
    // Import and register Angular component
    import('../custom-elements/angular-element/main.js').then(() => {
      console.log('Angular component loaded');
    });

    // Import and register React component
    import('../custom-elements/react-element/static/js/main.22de2038.js').then(() => {
      console.log('React component loaded');
    });
  });

  return (
    <div>
      <h1>Qwik Shell App</h1>
      <angular-element></angular-element>
      <react-element></react-element>
    </div>
  );
});