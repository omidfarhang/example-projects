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

type RustWasm = {
  default: () => Promise<unknown>;
  analyze_message: (input: string) => string;
  count_primes: (limit: number) => number;
};

type RustWasmApi = Pick<RustWasm, 'analyze_message' | 'count_primes'>;

declare global {
  interface Window {
    rustWasmApi?: RustWasmApi;
  }
}

export default component$(() => {
  const assetsReady = useSignal(false);
  const message = useSignal('Hello from the Qwik shell');
  const rustReady = useSignal(false);
  const rustStats = useSignal('Loading Rust WASM...');
  const rustBenchmark = useSignal('');

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

    importBrowserModule<RustWasm>(assetUrl('mfes/rust-wasm/rust_wasm.js'))
      .then(async (rust) => {
        await rust.default();
        window.rustWasmApi = rust;
        rustReady.value = true;
        rustStats.value = rust.analyze_message(message.value);
      })
      .catch(() => {
        rustStats.value =
          'Run `npm run build:rust` from the project root to enable Rust WASM.';
      });

    cleanup(() => {
      window.removeEventListener(
        'microfrontend:message',
        handleMicroFrontendMessage,
      );
    });
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => message.value);

    if (!window.rustWasmApi) {
      return;
    }

    rustStats.value = window.rustWasmApi.analyze_message(message.value);
  });

  const updateFromShell = $(() => {
    message.value = 'Qwik updated the contract for every micro frontend';
  });

  const runPrimeBenchmark = $(() => {
    if (!window.rustWasmApi) {
      return;
    }

    const limit = 500_000;
    rustBenchmark.value = 'Running prime sieve in Rust WASM...';

    const started = performance.now();
    const count = window.rustWasmApi.count_primes(limit);
    const elapsedMs = (performance.now() - started).toFixed(1);

    rustBenchmark.value = `Found ${count.toLocaleString()} primes up to ${limit.toLocaleString()} in ${elapsedMs} ms`;
  });

  return (
    <main class="demo">
      <section class="panel panel--qwik">
        <p class="eyebrow">Qwik shell application</p>
        <h1>Qwik composing Angular, React, and Rust</h1>
        <p class="panel__lede">
          The shell owns routing and shared state. Angular and React are loaded
          as custom elements, and Rust WebAssembly handles CPU work inside the
          shell.
        </p>
        <div class="panel__actions">
          <button type="button" onClick$={updateFromShell}>
            Update shared message from Qwik
          </button>
        </div>
      </section>

      <div class="shared-state">
        <span class="shared-state__label">Shared message</span>
        <span class="shared-state__value">{message.value}</span>
      </div>

      <section class="mfe-grid">
        {assetsReady.value ? (
          <>
            <angular-microfrontend
              message={message.value}
            ></angular-microfrontend>
            <react-microfrontend message={message.value}></react-microfrontend>
          </>
        ) : (
          <p class="mfe-grid__loading">Loading micro frontend bundles...</p>
        )}
      </section>

      <section class="panel panel--rust">
        <p class="eyebrow">Rust WebAssembly</p>
        <h2>Compute from WebAssembly</h2>
        <p class="panel__lede">
          Unlike Angular and React, Rust is not rendered as a custom element.
          The Qwik shell imports a WASM module when it needs fast native code.
        </p>
        <p class="wasm-stats">
          <strong>Shared message analysis</strong>
          {rustStats.value}
        </p>
        <div class="panel__actions">
          <button
            type="button"
            disabled={!rustReady.value}
            onClick$={runPrimeBenchmark}
          >
            Run prime sieve in Rust WASM
          </button>
        </div>
        {rustBenchmark.value ? (
          <p class="wasm-benchmark">{rustBenchmark.value}</p>
        ) : null}
      </section>
    </main>
  );
});
