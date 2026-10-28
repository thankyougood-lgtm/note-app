/* ==========================================================================
   NAVIGATION — Handles page switching, drawer, and filters
   ========================================================================== */

let currentFilter = 'all';
let currentPage = 'home';

/* ---- PAGE SWITCHING ---- */
function showPage(pageName) {
  currentPage = pageName;

  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });

  // Show the selected page
  const target = document.getElementById(`page-${pageName}`);
  if (target) {
    target.style.display = 'block';
  }

  // Update bottom nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });

  // Update drawer active state
  document.querySelectorAll('.drawer-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });

  // If going to Notes page, render the full list
  if (pageName === 'notes') {
    renderNotesPage();
  }

  // If going home, refresh home list too
  if (pageName === 'home') {
    applyFilter('all');
  }
  // If going to Folders page, render folder list
  if (pageName === 'folders') {
    renderFoldersPage();
  }
}


/* ---- FILTER LOGIC (shared between Home cards + Notes tabs) ---- */
function getNotesForFilter(filter) {
  switch (filter) {
    case 'favorites': return getFavoriteNotes();
    case 'trash': return getTrashedNotes();
    case 'folders': return [];
    default: return getActiveNotes();
  }
}

function applyFilter(filter) {
  currentFilter = filter;
  renderNotesList(getNotesForFilter(filter));
}

function renderNotesPage() {
  const notes = getNotesForFilter(currentFilter);
  renderNotesListFull(notes);

  // Sync filter tab active state
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === currentFilter);
  });
}

/* ---- DRAWER (Side Menu) ---- */
function openDrawer() {
  document.getElementById('sideDrawer').classList.add('active');
  document.getElementById('drawerOverlay').classList.add('active');
}

function closeDrawer() {
  document.getElementById('sideDrawer').classList.remove('active');
  document.getElementById('drawerOverlay').classList.remove('active');
}
