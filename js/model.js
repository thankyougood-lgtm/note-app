/* ===== The shape of a note: the ONE place that defines it ===== */

// Raise this number whenever the shape of a note changes
export const SCHEMA_VERSION = 2;

// Turn lines of text into checklist items.
// Items that already existed keep their ticked / unticked state.
export function linesToItems(text, oldItems = []) {
  const done = new Map(oldItems.map((i) => [i.text, i.done]));
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((t) => ({ text: t, done: done.get(t) || false }));
}

// Give an older note every field it is missing. Safe to run again and again.
export function upgradeNote(note) {
  const n = { ...note };
  if (n.body === undefined) n.body = "";
  if (n.favorite === undefined) n.favorite = false;
  if (n.trashed === undefined) n.trashed = false;
  if (n.pinned === undefined) n.pinned = false;
  if (n.color === undefined) n.color = "none";
  if (!Array.isArray(n.tags)) n.tags = [];
  if (n.folderId === undefined) n.folderId = null;
  if (!Array.isArray(n.items)) {
    n.items = n.type === "todo" ? linesToItems(n.body) : [];
  }
  n.schema = SCHEMA_VERSION;
  return n;
}

// A brand-new note with every field filled in
export function newNote({ title, body = "", type = "note" }) {
  const now = Date.now();
  return upgradeNote({ title, body, type, createdAt: now, updatedAt: now });
}
