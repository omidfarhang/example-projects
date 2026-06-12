import type { PresetId } from './presets';

export interface PresetTip {
  /** i18n key under tips.* */
  i18nKey: 'tips.allergy' | 'tips.candida' | 'tips.lifecycle';
}

export const PRESET_TIPS: Record<PresetId, PresetTip> = {
  allergy: { i18nKey: 'tips.allergy' },
  candida: { i18nKey: 'tips.candida' },
  lifecycle: { i18nKey: 'tips.lifecycle' },
};

const STORAGE_PREFIX = 'microbiome-tip-dismissed:';

export function isPresetTipDismissed(presetId: PresetId): boolean {
  try {
    return sessionStorage.getItem(STORAGE_PREFIX + presetId) === '1';
  } catch {
    return false;
  }
}

export function dismissPresetTip(presetId: PresetId): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + presetId, '1');
  } catch {
    /* sessionStorage unavailable */
  }
}
