/* ===== Kitchen: the actions that change notes ===== */
import { dbGetAll, dbSave, dbDelete } from "./db.js";
import { state, findNote } from "./store.js";

// Read all notes from the database into memory
export async function loadNotes() {
  state.notes = await dbGetAll();
}

// Create a new note, or update an existing one when `id` is given
export async function saveNote({ id, title, body, type }) {
  const now = Date.now();
  if (id) {
    const old = findNote(id);
    await dbSave({ ...old, title, body, type, updatedAt: now });
  } else {
    await dbSave({
      title,
      body,
      type,
      favorite: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
    });
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
