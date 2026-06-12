/** Touch gesture overlay markup for coarse-pointer devices. */
export function touchHintsPartial(): string {
  return `
            <div class="bd-touch-hints" data-touch-hints hidden>
              <button type="button" class="bd-touch-hints__dismiss" data-touch-hints-dismiss aria-label="Dismiss touch controls">×</button>
              <p class="bd-touch-hints__title">Touch controls</p>
              <ul class="bd-touch-hints__list">
                <li>
                  <svg class="bd-touch-hints__icon" viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
                    <path d="M16 7 A9 9 0 0 1 23 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="16" cy="7" r="2" fill="currentColor"/>
                  </svg>
                  <span>One finger — orbit</span>
                </li>
                <li>
                  <svg class="bd-touch-hints__icon" viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="11" cy="16" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="21" cy="16" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M7 16 H5 M27 16 H25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 12 L5 16 L8 20 M24 12 L27 16 L24 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Pinch — zoom</span>
                </li>
                <li>
                  <svg class="bd-touch-hints__icon" viewBox="0 0 32 32" aria-hidden="true">
                    <circle cx="10" cy="20" r="3" fill="currentColor" opacity="0.85"/>
                    <circle cx="22" cy="12" r="3" fill="currentColor" opacity="0.85"/>
                    <path d="M14 18 L20 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2"/>
                    <path d="M6 20 H26 M22 20 L18 16 M22 20 L18 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Two fingers — pan</span>
                </li>
              </ul>
            </div>`;
}
