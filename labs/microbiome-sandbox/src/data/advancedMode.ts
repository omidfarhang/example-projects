const STORAGE_KEY = 'bd-advanced-mode';

export const ADVANCED_DISCLAIMER =
  'Advanced panels show illustrative literature ranges and simplified immune/diet proxies — not clinical measurements or predictions.';

export function readAdvancedMode(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeAdvancedMode(enabled: boolean): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    /* ignore quota / private mode */
  }
}
