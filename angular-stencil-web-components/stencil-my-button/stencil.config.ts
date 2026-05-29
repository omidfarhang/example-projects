import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'stencil-my-button',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'www',
      serviceWorker: null,
    },
  ],
};
