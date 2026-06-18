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

   Week 2 note: if Week 2 ships as its own loader, route on the
   container, e.g.:
     if (document.getElementById('freedom-tracker-w2')) load('loader-w2.v1.js');
     else load(CURRENT_LOADER);
   ============================================================ */
(function () {
  'use strict';

  // >>> THE ONE LINE YOU EDIT ON EVERY UPGRADE <<<
  var CURRENT_LOADER = 'loader.v7.js';

  var BASE = 'https://dfonvielle.github.io/freedom-tracker/';

  var s = document.createElement('script');
  s.src = BASE + CURRENT_LOADER;
  s.async = true;
  document.head.appendChild(s);
})();
