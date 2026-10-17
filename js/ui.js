/* ===== Small UI parts: toast, pop-up menu, editor, welcome screen ===== */
import { $ } from "./utils.js";
import { state } from "./store.js";

/* ---------- Toast (small message at the bottom) ---------- */
let toastTimer;

export function toast(text) {
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

/* ---------- Pop-up menu (the three dots) ---------- */
let menuEl = null;

export function closeMenu() {
  if (menuEl) menuEl.remove();
  menuEl = null;
}

// items = [{ label, action, danger }]
export function showMenu(anchor, items) {
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

/* ---------- Editor dialog (add / edit a note) ---------- */
const editor = $("#editor");
const noteTitle = $("#note-title");
const noteBody = $("#note-body");
const noteType = $("#note-type");

// Open the editor: empty for a new note, filled for an existing one
export function openEditor(note) {
  state.editingId = note ? note.id : null;
  noteTitle.value = note ? note.title : "";
  noteBody.value = note ? note.body : "";
  noteType.value = note ? note.type : "note";
  editor.showModal();
  noteTitle.focus();
}

export function closeEditor() {
  editor.close();
}

// Read what the person typed
export function readEditor() {
  return {
    title: noteTitle.value.trim(),
    body: noteBody.value,
    type: noteType.value,
  };
}

/* ---------- Welcome screen ---------- */
function closeWelcome() {
  const welcome = $("#welcome");
  if (!welcome) return;
  welcome.classList.add("leave");
  setTimeout(() => welcome.remove(), 450);
}

/* ---------- Start the small listeners (call once) ---------- */
export function initUI() {
  // clicking anywhere outside the menu closes it
  document.addEventListener("click", (e) => {
    if (menuEl && !menuEl.contains(e.target) && !e.target.closest(".note-more, #btn-menu")) {
      closeMenu();
    }
  });

  // Cancel button, and a click on the dark backdrop, close the editor
  $("#btn-cancel").addEventListener("click", closeEditor);
  editor.addEventListener("click", (e) => {
    if (e.target === editor) closeEditor();
  });

  // the pencil on the welcome screen
  $("#btn-start").addEventListener("click", closeWelcome);
}
