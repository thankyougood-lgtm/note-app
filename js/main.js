cat > js/main.js << 'EOF'
/* ===== Note app: main.js (refactor step 4) ===== */
import { initDB, dbSave } from "./db.js";
import { $ } from "./utils.js";
import { state, findNote } from "./store.js";
import {
  loadNotes,
  saveNote,
  toggleFavorite,
  trashNote,
  restoreNote,
  deleteForever,
  emptyTrash,
} from "./notes.js";
import { render } from "./render.js";
import { toast, showMenu, openEditor, closeEditor, readEditor, initUI } from "./ui.js";

/* ---------- Elements ---------- */
const listEl = $("#notes-list");
const searchInput = $("#search-input");

/* ---------- Add / edit: save button ---------- */
$("#editor-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const { title, body, type } = readEditor();
  if (!title) return;

  await saveNote({ id: state.editingId, title, body, type });
  closeEditor();
  render();
});

$("#btn-add").addEventListener("click", () => openEditor(null));

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

/* ---------- List clicks ---------- */
listEl.addEventListener("click", (e) => {
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

/* ---------- Header buttons ---------- */
$("#btn-search").addEventListener("click", () => searchInput.focus());

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

/* ---------- Search, sort, chips, bottom nav ---------- */
searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
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
EOF