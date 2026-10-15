/* ===== Note app: main.js (refactor step 3) ===== */
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

/* ---------- Elements ---------- */
const listEl = $("#notes-list");
const searchInput = $("#search-input");
const editor = $("#editor");
const form = $("#editor-form");
const noteTitle = $("#note-title");
const noteBody = $("#note-body");
const noteType = $("#note-type");

/* ---------- Add / edit ---------- */
function openEditor(note) {
  state.editingId = note ? note.id : null;
  noteTitle.value = note ? note.title : "";
  noteBody.value = note ? note.body : "";
  noteType.value = note ? note.type : "note";
  editor.showModal();
  noteTitle.focus();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = noteTitle.value.trim();
  if (!title) return;

  await saveNote({
    id: state.editingId,
    title,
    body: noteBody.value,
    type: noteType.value,
  });
  editor.close();
  render();
});

$("#btn-cancel").addEventListener("click", () => editor.close());

// click on the dark backdrop closes the dialog
editor.addEventListener("click", (e) => {
  if (e.target === editor) editor.close();
});

$("#btn-add").addEventListener("click", () => openEditor(null));

/* ---------- Pop-up menu (three dots) ---------- */
let menuEl = null;

function closeMenu() {
  if (menuEl) menuEl.remove();
  menuEl = null;
}

function showMenu(anchor, items) {
  closeMenu();
  menuEl = document.createElement("div");
  menuEl.className = "menu";
  items.forEach(({ label, action, danger }) => {
    const b = document.createElement("button");
    b.textContent = label;
    if (danger) b.classList.add("danger");
    b.addEventListener("click", async () => {
      closeMenu();
      await action();
    });
    menuEl.appendChild(b);
  });
  document.body.appendChild(menuEl);

  const r = anchor.getBoundingClientRect();
  menuEl.style.top = `${r.bottom + 6}px`;
  menuEl.style.right = `${Math.max(12, window.innerWidth - r.right)}px`;
}

document.addEventListener("click", (e) => {
  if (menuEl && !menuEl.contains(e.target) && !e.target.closest(".note-more, #btn-menu")) {
    closeMenu();
  }
});

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

/* ---------- Toast message ---------- */
let toastTimer;
function toast(text) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

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

/* ---------- Welcome screen ---------- */
const welcome = $("#welcome");
$("#btn-start").addEventListener("click", () => {
  welcome.classList.add("leave");
  setTimeout(() => welcome.remove(), 450);
});

/* ---------- Start ---------- */
(async function init() {
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