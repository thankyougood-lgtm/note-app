/* ===== Note or Not: app.js ===== */

/* ---------- 1. IndexedDB (where notes are stored) ---------- */
const DB_NAME = "note-or-not";
const STORE = "notes";
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run(mode, action) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const request = action(t.objectStore(STORE));
    t.oncomplete = () => resolve(request ? request.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

const dbGetAll = () => run("readonly", (s) => s.getAll());
const dbSave = (note) => run("readwrite", (s) => s.put(note));
const dbDelete = (id) => run("readwrite", (s) => s.delete(id));

/* ---------- 2. State ---------- */
let notes = [];
let filter = "all";      // all | note | todo | favorites | trash
let query = "";
let sortBy = "latest";   // latest | oldest | title
let editingId = null;

/* ---------- 3. Elements ---------- */
const $ = (sel) => document.querySelector(sel);
const listEl = $("#notes-list");
const emptyEl = $("#empty-state");
const titleEl = $("#list-title");
const searchInput = $("#search-input");
const editor = $("#editor");
const form = $("#editor-form");
const noteTitle = $("#note-title");
const noteBody = $("#note-body");
const noteType = $("#note-type");

/* ---------- 4. Helpers ---------- */
function esc(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = 86400000;
  if (d >= startToday) return `Today, ${time}`;
  if (d >= startToday - day) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Which colored icon a note gets
function iconFor(n) {
  if (n.trashed) return { color: "red", icon: "i-trash" };
  if (n.favorite) return { color: "yellow", icon: "i-star" };
  if (n.type === "todo") return { color: "green", icon: "i-check" };
  return { color: "purple", icon: "i-note" };
}

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

const FILTER_TITLES = {
  all: "Recent Notes",
  note: "Notes",
  todo: "To-Do",
  favorites: "Favorites",
  trash: "Trash",
};

/* ---------- 5. Render ---------- */
function visibleNotes() {
  const q = query.trim().toLowerCase();
  let result = notes.filter((n) => {
    if (filter === "trash") return n.trashed;
    if (n.trashed) return false;
    if (filter === "note") return n.type === "note";
    if (filter === "todo") return n.type === "todo";
    if (filter === "favorites") return n.favorite;
    return true;
  });

  if (q) {
    result = result.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => {
    if (sortBy === "oldest") return a.updatedAt - b.updatedAt;
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return b.updatedAt - a.updatedAt;
  });
  return result;
}

function render() {
  const items = visibleNotes();
  titleEl.textContent = FILTER_TITLES[filter];

  listEl.innerHTML = items
    .map((n) => {
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
    })
    .join("");

  emptyEl.hidden = items.length > 0;
  if (filter === "trash") emptyEl.textContent = "Trash is empty.";
  else if (query) emptyEl.textContent = "No notes match your search.";
  else emptyEl.textContent = "No notes here yet. Tap + to add one.";

  // keep chips and bottom nav highlighted correctly
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

async function reload() {
  notes = await dbGetAll();
  render();
}

/* ---------- 6. Add / edit ---------- */
function openEditor(note) {
  editingId = note ? note.id : null;
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

  const now = Date.now();
  if (editingId) {
    const old = notes.find((n) => n.id === editingId);
    await dbSave({ ...old, title, body: noteBody.value, type: noteType.value, updatedAt: now });
  } else {
    await dbSave({
      title,
      body: noteBody.value,
      type: noteType.value,
      favorite: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  editor.close();
  await reload();
});

$("#btn-cancel").addEventListener("click", () => editor.close());

// click on the dark backdrop closes the dialog
editor.addEventListener("click", (e) => {
  if (e.target === editor) editor.close();
});

$("#btn-add").addEventListener("click", () => openEditor(null));

/* ---------- 7. Pop-up menu (three dots) ---------- */
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

async function update(id, changes) {
  const n = notes.find((x) => x.id === id);
  await dbSave({ ...n, ...changes, updatedAt: Date.now() });
  await reload();
}

function menuForNote(n) {
  if (n.trashed) {
    return [
      { label: "Restore", action: () => update(n.id, { trashed: false }) },
      {
        label: "Delete forever",
        danger: true,
        action: async () => {
          if (confirm("Delete this note forever?")) {
            await dbDelete(n.id);
            await reload();
          }
        },
      },
    ];
  }
  return [
    { label: "Edit", action: () => openEditor(n) },
    {
      label: n.favorite ? "Remove from favorites" : "Add to favorites",
      action: () => update(n.id, { favorite: !n.favorite }),
    },
    { label: "Move to trash", danger: true, action: () => update(n.id, { trashed: true }) },
  ];
}

/* ---------- 8. List clicks ---------- */
listEl.addEventListener("click", (e) => {
  const li = e.target.closest(".note");
  if (!li) return;
  const note = notes.find((n) => n.id === Number(li.dataset.id));
  if (!note) return;

  const more = e.target.closest(".note-more");
  if (more) {
    showMenu(more, menuForNote(note));
  } else if (!note.trashed) {
    openEditor(note);
  }
});

/* ---------- 9. Header buttons ---------- */
$("#btn-search").addEventListener("click", () => searchInput.focus());

$("#btn-menu").addEventListener("click", (e) => {
  showMenu(e.currentTarget, [
    {
      label: "Empty trash",
      danger: true,
      action: async () => {
        const trashed = notes.filter((n) => n.trashed);
        if (!trashed.length) return toast("Trash is already empty");
        if (confirm(`Delete ${trashed.length} note(s) forever?`)) {
          await Promise.all(trashed.map((n) => dbDelete(n.id)));
          await reload();
        }
      },
    },
  ]);
});

/* ---------- 10. Search, sort, chips, bottom nav ---------- */
searchInput.addEventListener("input", () => {
  query = searchInput.value;
  render();
});

$("#sort-select").addEventListener("change", (e) => {
  sortBy = e.target.value;
  render();
});

$("#chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  filter = chip.dataset.filter;
  render();
});

document.querySelectorAll(".nav-item").forEach((btn) =>
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    if (view === "home") { filter = "all"; render(); }
    else if (view === "favorites") { filter = "favorites"; render(); }
    else toast("Coming soon");
  })
);

/* ---------- 11. Toast message ---------- */
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

/* ---------- 12. First-run sample notes ---------- */
async function seed() {
  if (localStorage.getItem("seeded")) return;
  const now = Date.now();
  const sample = [
    { title: "Welcome to Note or Not", body: "This is your space to write notes, ideas, reminders, and more. Keep it simple. Keep it yours.", type: "note", favorite: false },
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
/* ---------- 13. Start ---------- */
(async function init() {
  db = await openDB();
  await seed();
  await reload();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((err) =>
      console.log("Service worker not registered:", err)
    );
  }
})();