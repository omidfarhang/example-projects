import '@builder.io/qwik';

declare module '@builder.io/qwik' {
  interface QwikIntrinsicElements {
    'angular-microfrontend': {
      message?: string;
    };
    'react-microfrontend': {
      message?: string;
    };
  }
}
