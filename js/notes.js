/* ===== Kitchen: the actions that change notes ===== */
import { dbGetAll, dbSave, dbDelete } from "./db.js";
import { state, findNote } from "./store.js";
import { newNote, upgradeNote, linesToItems } from "./model.js";

// Read all notes from the database into memory
export async function loadNotes() {
  const all = await dbGetAll();
  state.notes = all.map(upgradeNote); // safety net: every note has every field
}

// Create a new note, or update an existing one when `id` is given
export async function saveNote({ id, title, body, type }) {
  if (id) {
    const old = findNote(id);
    const items = type === "todo" ? linesToItems(body, old.items) : [];
    await dbSave({ ...old, title, body, type, items, updatedAt: Date.now() });
  } else {
    await dbSave(newNote({ title, body, type }));
  }
  await loadNotes();
}

// Change some fields of one note (private helper)
async function changeNote(id, changes) {
  const note = findNote(id);
  await dbSave({ ...note, ...changes, updatedAt: Date.now() });
  await loadNotes();
}

export const toggleFavorite = (note) => changeNote(note.id, { favorite: !note.favorite });
export const trashNote = (id) => changeNote(id, { trashed: true });
export const restoreNote = (id) => changeNote(id, { trashed: false });

// Remove one note for good
export async function deleteForever(id) {
  await dbDelete(id);
  await loadNotes();
}

// Remove every note in the trash
export async function emptyTrash() {
  const trashed = state.notes.filter((n) => n.trashed);
  await Promise.all(trashed.map((n) => dbDelete(n.id)));
  await loadNotes();
}
