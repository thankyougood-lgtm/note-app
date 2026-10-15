/* ===== Plating: draws the notes on the page ===== */
import { $, esc, formatDate } from "./utils.js";
import { state, visibleNotes } from "./store.js";

const listEl = $("#notes-list");
const emptyEl = $("#empty-state");
const titleEl = $("#list-title");

const FILTER_TITLES = {
  all: "Recent Notes",
  note: "Notes",
  todo: "To-Do",
  favorites: "Favorites",
  trash: "Trash",
};

// Which colored icon a note gets
function iconFor(n) {
  if (n.trashed) return { color: "red", icon: "i-trash" };
  if (n.favorite) return { color: "yellow", icon: "i-star" };
  if (n.type === "todo") return { color: "green", icon: "i-check" };
  return { color: "purple", icon: "i-note" };
}

// The short text shown under the title
function previewFor(n) {
  if (n.type === "todo") {
    return n.body
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => "• " + l.trim())
      .join("\n");
  }
  return n.body;
}

// The HTML of one note card
function noteCard(n) {
  const { color, icon } = iconFor(n);
  return `
    <li class="note" data-id="${n.id}">
      <div class="note-icon ${color}">
        <svg><use href="#${icon}"/></svg>
      </div>
      <div class="note-body">
        <div class="note-top">
          <h3 class="note-title">${esc(n.title)}</h3>
          <span class="note-date">${formatDate(n.updatedAt)}</span>
        </div>
        <p class="note-preview">${esc(previewFor(n))}</p>
      </div>
      <button class="note-more" aria-label="Note options">
        <svg width="22" height="22"><use href="#i-dots"/></svg>
      </button>
    </li>`;
}

// Fill the list with cards
function renderList(items) {
  titleEl.textContent = FILTER_TITLES[state.filter];
  listEl.innerHTML = items.map(noteCard).join("");
}

// Show a message when there is nothing to list
function renderEmpty(items) {
  emptyEl.hidden = items.length > 0;
  if (state.filter === "trash") emptyEl.textContent = "Trash is empty.";
  else if (state.query) emptyEl.textContent = "No notes match your search.";
  else emptyEl.textContent = "No notes here yet. Tap the pencil to add one.";
}

// Keep the chips and the bottom bar highlighted correctly
function renderHighlights() {
  const { filter } = state;
  document.querySelectorAll(".chip").forEach((c) =>
    c.classList.toggle("active", c.dataset.filter === filter)
  );
  document.querySelectorAll(".nav-item").forEach((b) =>
    b.classList.toggle(
      "active",
      (b.dataset.view === "home" && filter !== "favorites") ||
        (b.dataset.view === "favorites" && filter === "favorites")
    )
  );
}

// The only function other files need: redraw everything from the current state
export function render() {
  const items = visibleNotes();
  renderList(items);
  renderEmpty(items);
  renderHighlights();
}