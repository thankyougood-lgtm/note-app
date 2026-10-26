/* ===== Note app: main.js (the manager, refactor step 6) ===== */
import { initDB } from "./db.js";
import { seed } from "./seed.js";
import { loadNotes } from "./notes.js";
import { render } from "./render.js";
import { initUI } from "./ui.js";
import { initEvents } from "./events.js";
import { registerServiceWorker } from "./pwa.js";

async function startApp() {
  initUI();          // menu, editor and welcome screen listeners
  initEvents();      // all the click and typing listeners
  await initDB();    // open the database
  await seed();      // sample notes on the very first run
  await loadNotes(); // read the notes into memory
  render();          // draw them on the page
  registerServiceWorker();
}

startApp();