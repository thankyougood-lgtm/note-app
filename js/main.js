/* ===== Note app: main.js (refactor step 5) ===== */
import { initDB, dbSave } from "./db.js";
import { loadNotes } from "./notes.js";
import { render } from "./render.js";
import { initUI } from "./ui.js";
import { initEvents } from "./events.js";

/* ---------- First-run sample notes ---------- */
async function seed() {
  if (localStorage.getItem("seeded")) return;
  const now = Date.now();
  const sample = [
    { title: "Welcome to Note app", body: "This is your space to write notes, ideas, reminders, and more. Keep it simple. Keep it yours.", type: "note", favorite: false },
    { title: "Today's To-Do", body: "Finish the project\nRead a book\nExercise", type: "todo", favorite: false },
    { title: "Ideas", body: "Build something useful. Maybe a PWA app that works offline.", type: "note", favorite: true },
  ];
  for (let i = 0; i < sample.length; i++) {
    const t = now - i * 60000; // one minute apart so the order is stable
    await dbSave({ ...sample[i], trashed: false, createdAt: t, updatedAt: t });
  }
  localStorage.setItem("seeded", "1");
}

/* ---------- Start ---------- */
(async function init() {
  initUI();
  initEvents();
  await initDB();
  await seed();
  await loadNotes();
  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((err) =>
      console.log("Service worker not registered:", err)
    );
  }
})();
