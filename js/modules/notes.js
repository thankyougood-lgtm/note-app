/* ==========================================================================
   NOTES — All note-related logic (Create, Read, Update, Delete)
   ========================================================================== */

function getAllNotes() {
  return getStorage();
}

function saveNote(note) {
  const notes = getStorage();
  notes.unshift(note); // newest first
  setStorage(notes);
}

function createNote({ title, body, color }) {
  const note = {
    id: generateId(),
    title: title || 'Untitled',
    body: body || '',
    color: color || 'blue',
    isFavorite: false,
    isTrashed: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  saveNote(note);
  return note;
}

function updateNoteById(id, updates) {
  const notes = getStorage();
  const index = notes.findIndex(n => n.id === id);
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates, updatedAt: Date.now() };
    setStorage(notes);
  }
}

function toggleFavorite(id) {
  const notes = getStorage();
  const note = notes.find(n => n.id === id);
  if (note) {
    note.isFavorite = !note.isFavorite;
    setStorage(notes);
  }
}

function moveToTrash(id) {
  updateNoteById(id, { isTrashed: true });
}

function restoreFromTrash(id) {
  updateNoteById(id, { isTrashed: false });
}

function deleteForever(id) {
  const notes = getStorage().filter(n => n.id !== id);
  setStorage(notes);
}

function getActiveNotes() {
  return getAllNotes().filter(n => !n.isTrashed);
}

function getFavoriteNotes() {
  return getActiveNotes().filter(n => n.isFavorite);
}

function getTrashedNotes() {
  return getAllNotes().filter(n => n.isTrashed);
}

function getCounts() {
  return {
    all: getActiveNotes().length,
    favorites: getFavoriteNotes().length,
    trash: getTrashedNotes().length,
    folders: 0 // we'll build real folders in a later step
  };
}