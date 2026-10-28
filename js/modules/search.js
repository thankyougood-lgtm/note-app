/* ==========================================================================
   SEARCH — Filters notes by text query
   ========================================================================== */

function filterNotesBySearch(notes, query) {
  if (!query) return notes;
  const q = query.toLowerCase();
  return notes.filter(n =>
    n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
  );
}