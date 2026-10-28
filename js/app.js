/* ==========================================================================
   APP — Main entry point. Wires up all event listeners.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  loadTheme();
  renderCounts();
  showPage('home');

  const modal = document.getElementById('noteModal');
  const titleInput = document.getElementById('noteTitleInput');
  const bodyInput = document.getElementById('noteBodyInput');
  const colors = ['blue', 'green', 'purple', 'red'];

  /* ======================================================
     DRAWER (Hamburger Menu)
     ====================================================== */
  document.getElementById('menuBtn').addEventListener('click', openDrawer);
  document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      const filter = item.dataset.filter;

      if (filter) currentFilter = filter;
      showPage(page);
      closeDrawer();
    });
  });

  /* ======================================================
     BOTTOM NAVIGATION
     ====================================================== */
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      showPage(item.dataset.page);
    });
  });

  /* ======================================================
     HOME PAGE: Quick Action Cards
     ====================================================== */
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.dataset.filter;
      currentFilter = filter;

      if (filter === 'folders') {
        showPage('folders');
      } else {
        showPage('notes');
      }
    });
  });

  /* ======================================================
     HOME PAGE: "View All" link
     ====================================================== */
  document.getElementById('viewAllBtn').addEventListener('click', (e) => {
    e.preventDefault();
    currentFilter = 'all';
    showPage('notes');
  });

  /* ======================================================
     NOTES PAGE: Filter Tabs (All / Favorites / Trash)
     ====================================================== */
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter = tab.dataset.filter;
      renderNotesPage();
    });
  });

  /* ======================================================
     SEARCH — Home page search bar
     ====================================================== */
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const base = getNotesForFilter('all');
    renderNotesList(filterNotesBySearch(base, e.target.value));
  });

  /* ======================================================
     SEARCH — Notes page search bar
     ====================================================== */
  document.getElementById('searchInputNotes').addEventListener('input', (e) => {
    const base = getNotesForFilter(currentFilter);
    renderNotesListFull(filterNotesBySearch(base, e.target.value));
  });

  /* ======================================================
     NOTE CARD ACTIONS (3-dot dropdown: Favorite / Trash / Restore / Delete)
     Works on BOTH home list and full notes list
     ====================================================== */
  function handleNoteCardClick(e) {

    /* ---- Toggle dropdown open/close ---- */
    const toggleBtn = e.target.closest('[data-action="toggle-menu"]');
    if (toggleBtn) {
      e.stopPropagation();
      const id = toggleBtn.dataset.id;
      const dropdown = document.getElementById(`dropdown-${id}`);

      document.querySelectorAll('.note-dropdown-menu.active').forEach(menu => {
        if (menu.id !== `dropdown-${id}`) menu.classList.remove('active');
      });

      dropdown.classList.toggle('active');
      return;
    }

    /* ---- Favorite / Unfavorite ---- */
    const favBtn = e.target.closest('[data-action="favorite"]');
    if (favBtn) {
      e.stopPropagation();
      toggleFavorite(favBtn.dataset.id);
      renderCounts();
      refreshCurrentView();
      return;
    }

    /* ---- Move to Trash ---- */
    const trashBtn = e.target.closest('[data-action="trash"]');
    if (trashBtn) {
      e.stopPropagation();
      moveToTrash(trashBtn.dataset.id);
      renderCounts();
      refreshCurrentView();
      showToast('Moved to Trash');
      return;
    }

    /* ---- Restore from Trash ---- */
    const restoreBtn = e.target.closest('[data-action="restore"]');
    if (restoreBtn) {
      e.stopPropagation();
      restoreFromTrash(restoreBtn.dataset.id);
      renderCounts();
      refreshCurrentView();
      showToast('Note restored', 'success');
      return;
    }

    /* ---- Delete Forever ---- */
    const deleteBtn = e.target.closest('[data-action="delete-forever"]');
    if (deleteBtn) {
      e.stopPropagation();
      showConfirm('Delete this note permanently? This cannot be undone.', {
        title: 'Delete Forever?',
        confirmText: 'Delete'
      }).then((confirmed) => {
        if (confirmed) {
          deleteForever(deleteBtn.dataset.id);
          renderCounts();
          refreshCurrentView();
          showToast('Note deleted', 'danger');
        }
      });
      return;
    }
  }

  document.getElementById('notesList').addEventListener('click', handleNoteCardClick);
  document.getElementById('notesListFull').addEventListener('click', handleNoteCardClick);

  /* ---- Close any open dropdown when clicking elsewhere on screen ---- */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.note-card-top-actions')) {
      document.querySelectorAll('.note-dropdown-menu.active').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });

  function refreshCurrentView() {
    if (currentPage === 'notes') {
      renderNotesPage();
    } else {
      applyFilter('all');
    }
  }

  /* ======================================================
     FAB: Open "Add Note" Modal
     ====================================================== */
  document.getElementById('fabAddNote').addEventListener('click', () => {
    titleInput.value = '';
    bodyInput.value = '';
    modal.classList.add('active');
    setTimeout(() => titleInput.focus(), 300);
  });

  document.getElementById('modalCancelBtn').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.getElementById('modalSaveBtn').addEventListener('click', () => {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title && !body) {
      modal.classList.remove('active');
      return;
    }

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    createNote({ title: title || 'Untitled', body, color: randomColor });

    modal.classList.remove('active');
    renderCounts();
    refreshCurrentView();
    showToast('Note saved', 'success');
  });
  /* ======================================================
     FOLDERS PAGE
     ====================================================== */
  const createFolderBtn = document.getElementById('createFolderBtn');
  if (createFolderBtn) {
    createFolderBtn.addEventListener('click', async () => {
      const name = await showPrompt('Give your folder a name', {
        title: 'New Folder',
        confirmText: 'Create'
      });
      if (name) {
        createFolder(name);
        renderFoldersPage();
        showToast('Folder created', 'success');
      }
    });
  }
  /* ======================================================
     SETTINGS PAGE
     ====================================================== */
  const darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) {
    darkToggle.addEventListener('change', toggleTheme);
  }

  const clearBtn = document.getElementById('clearDataBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      const confirmed = await showConfirm(
        'This will delete ALL notes and settings permanently.',
        { title: 'Clear All Data?', confirmText: 'Delete Everything' }
      );
      if (confirmed) {
        localStorage.clear();
        resetTheme();
        renderCounts();
        refreshCurrentView();
        showToast('All data cleared', 'success');
      }
    });
  }

  const exportPdfBtn = document.getElementById('exportPdfBtn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', exportNotesAsPdf);
  }

  const exportDocBtn = document.getElementById('exportDocBtn');
  if (exportDocBtn) {
    exportDocBtn.addEventListener('click', exportNotesAsDoc);
  }

});
