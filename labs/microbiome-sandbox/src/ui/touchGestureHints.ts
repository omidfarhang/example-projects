const STORAGE_KEY = 'bd-touch-hints-dismissed';

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

/** Show orbit / zoom / pan hints on touch devices; dismiss on tap or first canvas touch. */
export function initTouchGestureHints(viewport: HTMLElement, canvas: HTMLCanvasElement): void {
  const overlay = viewport.querySelector('[data-touch-hints]') as HTMLElement | null;
  if (!overlay || !isTouchDevice()) return;
  if (sessionStorage.getItem(STORAGE_KEY) === '1') {
    overlay.hidden = true;
    return;
  }

  overlay.hidden = false;

  const dismiss = () => {
    overlay.classList.add('bd-touch-hints--dismissed');
    sessionStorage.setItem(STORAGE_KEY, '1');
    window.setTimeout(() => {
      overlay.hidden = true;
    }, 280);
    canvas.removeEventListener('touchstart', onCanvasTouch, true);
  };

  const onCanvasTouch = () => dismiss();

  overlay.querySelector('[data-touch-hints-dismiss]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismiss();
  });
  canvas.addEventListener('touchstart', onCanvasTouch, { passive: true, capture: true });
}
