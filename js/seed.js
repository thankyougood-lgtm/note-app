/* ===== First-run sample notes ===== */
import { dbSave } from "./db.js";

const SAMPLE = [
  { title: "Welcome to Note app", body: "This is your space to write notes, ideas, reminders, and more. Keep it simple. Keep it yours.", type: "note", favorite: false },
  { title: "Today's To-Do", body: "Finish the project\nRead a book\nExercise", type: "todo", favorite: false },
  { title: "Ideas", body: "Build something useful. Maybe a PWA app that works offline.", type: "note", favorite: true },
];

// Adds the sample notes once, the very first time the app opens
export async function seed() {
  if (localStorage.getItem("seeded")) return;
  const now = Date.now();
  for (let i = 0; i < SAMPLE.length; i++) {
    const t = now - i * 60000; // one minute apart so the order is stable
    await dbSave({ ...SAMPLE[i], trashed: false, createdAt: t, updatedAt: t });
  }
  localStorage.setItem("seeded", "1");
}
