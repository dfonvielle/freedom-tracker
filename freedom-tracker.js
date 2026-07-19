/* ============================================================
   FREEDOM TRACKER BOOTSTRAP — permanent entry point.
   Host as: https://YOUR-USER.github.io/freedom-tracker/freedom-tracker.js

   ALL lesson stubs reference THIS file, forever:

     <div id="freedom-tracker" data-view="today"></div>
     <script src="https://dfonvielle.github.io/freedom-tracker/freedom-tracker.js"></script>

   To upgrade the app: change CURRENT_LOADER below, commit. Done.
   Every lesson picks it up within ~10 minutes (GitHub Pages cache).
   To roll back: point it at the previous version, commit.
   NEVER rename this file — its stable name is the whole point.

   SURFACE ROUTING — one bootstrap, every surface:
     <div id="freedom-home">    -> CURRENT_HOME   (the one-page rail)
     anything else              -> CURRENT_LOADER (the full tracker,
                                   original behavior for every old stub)
   ============================================================ */
(function () {
  'use strict';

  // >>> THE LINES YOU EDIT ON EVERY UPGRADE <<<
  var CURRENT_LOADER = 'loader.v7.js';        // full tracker views
  var CURRENT_HOME = 'freedom-home.v1.js';    // Freedom Home one-page rail

  var BASE = 'https://dfonvielle.github.io/freedom-tracker/';

  function load(file) {
    var s = document.createElement('script');
    s.src = BASE + file;
    s.async = true;
    document.head.appendChild(s);
  }

  if (document.getElementById('freedom-home')) { load(CURRENT_HOME); }
  else { load(CURRENT_LOADER); }
})();
