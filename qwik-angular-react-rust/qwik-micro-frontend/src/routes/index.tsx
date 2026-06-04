import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

type MicroFrontendEvent = CustomEvent<{
  source: string;
  message: string;
}>;

const assetBase = import.meta.env.BASE_URL;

const assetUrl = (path: string) => {
  const base = assetBase.endsWith('/') ? assetBase : `${assetBase}/`;
  return `${base}${path.replace(/^\//, '')}`;
};

const scripts = new Map<string, Promise<void>>();
const importBrowserModule = new Function(
  'src',
  'return import(src)',
) as <T>(src: string) => Promise<T>;

const loadScript = (src: string) => {
  if (scripts.has(src)) {
    return scripts.get(src);
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );

    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.append(script);
  });

  scripts.set(src, promise);
  return promise;
};

export default component$(() => {
  const assetsReady = useSignal(false);
  const message = useSignal('Hello from the Qwik shell');
  const rustMessage = useSignal('Rust WASM has not been built yet.');

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const handleMicroFrontendMessage = (event: Event) => {
      const { source, message: nextMessage } = (event as MicroFrontendEvent)
        .detail;
      message.value = `${source}: ${nextMessage}`;
    };

    window.addEventListener(
      'microfrontend:message',
      handleMicroFrontendMessage,
    );

    Promise.all([
      loadScript(assetUrl('mfes/angular/polyfills.js')),
      loadScript(assetUrl('mfes/angular/main.js')),
      loadScript(assetUrl('mfes/react/react-microfrontend.js')),
    ]).then(() => {
      assetsReady.value = true;
    });

    importBrowserModule<{
      default: () => Promise<unknown>;
      format_message: (input: string) => string;
    }>(
      assetUrl('mfes/rust-wasm/rust_wasm.js'),
    )
      .then(async (rust) => {
        await rust.default();
        rustMessage.value = rust.format_message('Qwik loaded Rust WASM');
      })
      .catch(() => {
        rustMessage.value =
          'Run `npm run build:rust` from the project root to enable Rust WASM.';
      });

    cleanup(() => {
      window.removeEventListener(
        'microfrontend:message',
        handleMicroFrontendMessage,
      );
    });
  });

  const updateFromShell = $(() => {
    message.value = 'Qwik updated the contract for every micro frontend';
  });

  return (
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">Qwik shell application</p>
        <h1>Qwik composing Angular, React, and Rust</h1>
        <p>
          The shell owns routing and shared state. Angular and React are loaded
          as custom elements, and Rust provides a small WebAssembly function.
        </p>
        <button type="button" onClick$={updateFromShell}>
          Update shared message from Qwik
        </button>
      </section>

      <section class="status">
        <strong>Shared message:</strong>
        <span>{message.value}</span>
      </section>

      <section class="grid">
        {assetsReady.value ? (
          <>
            <angular-microfrontend
              message={message.value}
            ></angular-microfrontend>
            <react-microfrontend message={message.value}></react-microfrontend>
          </>
        ) : (
          <p>Loading micro frontend bundles...</p>
        )}
      </section>

      <section class="wasm-card">
        <p class="eyebrow">Rust WebAssembly</p>
        <p>{rustMessage.value}</p>
      </section>
    </main>
  );
});