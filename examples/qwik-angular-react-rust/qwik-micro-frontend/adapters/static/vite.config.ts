import { staticAdapter } from '@builder.io/qwik-city/adapters/static/vite';
import { extendConfig } from '@builder.io/qwik-city/vite';
import baseConfig from '../../vite.config';

const playgroundBase =
  process.env.PLAYGROUND_BASE ?? '/examples/qwik-angular-react-rust/';
const playgroundOrigin = (
  process.env.PLAYGROUND_ORIGIN ??
  'https://playground.omid.dev/examples/qwik-angular-react-rust'
).replace(/\/$/, '');

export default extendConfig(baseConfig, () => ({
  base: playgroundBase,
  build: {
    ssr: true,
    rollupOptions: {
      input: ['@qwik-city-plan'],
    },
  },
  plugins: [
    staticAdapter({
      origin: playgroundOrigin,
      include: ['/*'],
      emit404Pages: false,
    }),
  ],
}));
