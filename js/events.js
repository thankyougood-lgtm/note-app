/* ===== Waiters: every click and typing listener ===== */
import { $ } from "./utils.js";
import { state, findNote } from "./store.js";
import {
  saveNote,
  toggleFavorite,
  trashNote,
  restoreNote,
  deleteForever,
  emptyTrash,
} from "./notes.js";
import { render } from "./render.js";
import { toast, showMenu, openEditor, closeEditor, readEditor } from "./ui.js";

/* ---------- What the three dots on a note offer ---------- */
function menuForNote(n) {
  if (n.trashed) {
    return [
      {
        label: "Restore",
        action: async () => {
          await restoreNote(n.id);
          render();
        },
      },
      {
        label: "Delete forever",
        danger: true,
        action: async () => {
          if (confirm("Delete this note forever?")) {
            await deleteForever(n.id);
            render();
          }
        },
      },
    ];
  }
  return [
    { label: "Edit", action: () => openEditor(n) },
    {
      label: n.favorite ? "Remove from favorites" : "Add to favorites",
      action: async () => {
        await toggleFavorite(n);
        render();
      },
    },
    {
      label: "Move to trash",
      danger: true,
      action: async () => {
        await trashNote(n.id);
        render();
      },
    },
  ];
}

/* ---------- The add / edit pop-up: pencil button and Save ---------- */
function setupEditor() {
  $("#btn-add").addEventListener("click", () => openEditor(null));

  $("#editor-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { title, body, type } = readEditor();
    if (!title) return;

    await saveNote({ id: state.editingId, title, body, type });
    closeEditor();
    render();
  });
}

/* ---------- Clicks on the note cards ---------- */
function setupList() {
  $("#notes-list").addEventListener("click", (e) => {
    const li = e.target.closest(".note");
    if (!li) return;
    const note = findNote(Number(li.dataset.id));
    if (!note) return;

    const more = e.target.closest(".note-more");
    if (more) {
      showMenu(more, menuForNote(note));
    } else if (!note.trashed) {
      openEditor(note);
    }
  });
}

/* ---------- The search and menu buttons in the header ---------- */
function setupHeader() {
  $("#btn-search").addEventListener("click", () => $("#search-input").focus());

  $("#btn-menu").addEventListener("click", (e) => {
    showMenu(e.currentTarget, [
      {
        label: "Empty trash",
        danger: true,
        action: async () => {
          const count = state.notes.filter((n) => n.trashed).length;
          if (!count) return toast("Trash is already empty");
          if (confirm(`Delete ${count} note(s) forever?`)) {
            await emptyTrash();
            render();
          }
        },
      },
    ]);
  });
}

/* ---------- Search box, sort, chips and the bottom bar ---------- */
function setupFilters() {
  $("#search-input").addEventListener("input", (e) => {
    state.query = e.target.value;
    render();
  });

  $("#sort-select").addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    render();
  });

  $("#chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.filter = chip.dataset.filter;
    render();
  });

  document.querySelectorAll(".nav-item").forEach((btn) =>
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      if (view === "home") { state.filter = "all"; render(); }
      else if (view === "favorites") { state.filter = "favorites"; render(); }
      else toast("Coming soon");
    })
  );
}

/* ---------- Start all the listeners (call once) ---------- */
export function initEvents() {
  setupEditor();
  setupList();
  setupHeader();
  setupFilters();
}
