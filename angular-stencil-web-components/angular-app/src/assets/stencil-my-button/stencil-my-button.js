import { p as promiseResolve, b as bootstrapLazy } from './index-_YcaRUs3.js';
export { s as setNonce } from './index-_YcaRUs3.js';
import { g as globalScripts } from './app-globals-DQuL1Twl.js';

/*
 Stencil Client Patch Browser v4.43.5 | MIT Licensed | https://stenciljs.com
 */

var patchBrowser = () => {
  const importMeta = import.meta.url;
  const opts = {};
  if (importMeta !== "") {
    opts.resourcesUrl = new URL(".", importMeta).href;
  }
  return promiseResolve(opts);
};

patchBrowser().then(async (options) => {
  await globalScripts();
  return bootstrapLazy([["my-button",[[513,"my-button",{"text":[1]}]]]], options);
});
