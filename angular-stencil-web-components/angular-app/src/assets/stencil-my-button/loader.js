import { b as bootstrapLazy } from './index-_YcaRUs3.js';
export { s as setNonce } from './index-_YcaRUs3.js';
import { g as globalScripts } from './app-globals-DQuL1Twl.js';

const defineCustomElements = async (win, options) => {
  if (typeof window === 'undefined') return undefined;
  await globalScripts();
  return bootstrapLazy([["my-button",[[513,"my-button",{"text":[1]}]]]], options);
};

export { defineCustomElements };
