(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/chunk-b674a675.js")
    );
  })().catch(console.error);

})();
