/* ===== Memory: what the app currently knows ===== */

// One shared object. Other files read it and change its fields.
export const state = {
  notes: [],          // every note loaded from the database
  filter: "all",      // all | note | todo | favorites | trash
  query: "",          // text typed in the search bar
  sortBy: "latest",   // latest | oldest | title
  editingId: null,    // id of the note being edited (null = a new note)
};

// Find one note by its id
export function findNote(id) {
  return state.notes.find((n) => n.id === id);
}

// The notes that match the current filter, search and sort
export function visibleNotes() {
  const q = state.query.trim().toLowerCase();

  let result = state.notes.filter((n) => {
    if (state.filter === "trash") return n.trashed;
    if (n.trashed) return false;
    if (state.filter === "note") return n.type === "note";
    if (state.filter === "todo") return n.type === "todo";
    if (state.filter === "favorites") return n.favorite;
    return true;
  });

  if (q) {
    result = result.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => {
    if (state.sortBy === "oldest") return a.updatedAt - b.updatedAt;
    if (state.sortBy === "title") return a.title.localeCompare(b.title);
    return b.updatedAt - a.updatedAt;
  });

  return result;
}