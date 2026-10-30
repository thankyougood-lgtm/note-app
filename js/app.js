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
  let editingNoteId = null;

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
      const dropdown = toggleBtn.parentElement.querySelector('.note-dropdown-menu');

      document.querySelectorAll('.note-dropdown-menu.active').forEach(menu => {
        if (menu !== dropdown) menu.classList.remove('active');
      });

      const isOpening = !dropdown.classList.contains('active');
      dropdown.classList.toggle('active');

      if (isOpening) {
        const btnRect = toggleBtn.getBoundingClientRect();
        const dropdownHeight = dropdown.offsetHeight || 220;
        const spaceBelow = window.innerHeight - btnRect.bottom;

        if (spaceBelow < dropdownHeight + 80) {
          dropdown.style.top = (btnRect.top - dropdownHeight - 4) + 'px';
        } else {
          dropdown.style.top = (btnRect.bottom + 4) + 'px';
        }

        dropdown.style.left = (btnRect.right - dropdown.offsetWidth) + 'px';
      }
      return;
    }

    /* ---- Favorite / Unfavorite ---- */
    const favBtn = e.target.closest('[data-action="favorite"]');
    if (favBtn) {
      e.stopPropagation();
      toggleFavorite(favBtn.dataset.id);
      renderCounts();
      patchNoteCard(favBtn.dataset.id);
      return;
    }

    /* ---- Export as PDF ---- */
    const exportPdfItem = e.target.closest('[data-action="export-pdf"]');
    if (exportPdfItem) {
      e.stopPropagation();
      exportSingleNoteAsPdf(exportPdfItem.dataset.id);
      return;
    }

    /* ---- Export as DOC ---- */
    const exportDocItem = e.target.closest('[data-action="export-doc"]');
    if (exportDocItem) {
      e.stopPropagation();
      exportSingleNoteAsDoc(exportDocItem.dataset.id);
      showToast('Note exported', 'success');
      return;
    }

    /* ---- Move to Trash ---- */
    const trashBtn = e.target.closest('[data-action="trash"]');
    if (trashBtn) {
      e.stopPropagation();
      moveToTrash(trashBtn.dataset.id);
      renderCounts();
      patchNoteCard(trashBtn.dataset.id);
      showToast('Moved to Trash');
      return;
    }

    /* ---- Restore from Trash ---- */
    const restoreBtn = e.target.closest('[data-action="restore"]');
    if (restoreBtn) {
      e.stopPropagation();
      restoreFromTrash(restoreBtn.dataset.id);
      renderCounts();
      patchNoteCard(restoreBtn.dataset.id);
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
          patchNoteCard(deleteBtn.dataset.id);
          showToast('Note deleted', 'danger');
        }
      });
      return;
    }

    /* ---- Open note for editing (click on card body) ---- */
    const card = e.target.closest('.note-card');
    if (card && !e.target.closest('.note-card-top-actions') && !e.target.closest('.note-card-star')) {
      const note = getAllNotes().find(n => n.id === card.dataset.id);
      if (note) {
        editingNoteId = note.id;
        titleInput.value = note.title === 'Untitled' ? '' : note.title;
        bodyInput.value = note.body || '';
        populateFolderSelect(note.folderId);
        modal.classList.add('active');
        setTimeout(() => titleInput.focus(), 300);
      }
    }
  }

  document.getElementById('notesList').addEventListener('click', handleNoteCardClick);
  document.getElementById('notesListFull').addEventListener('click', handleNoteCardClick);

  /* ---- Close any open dropdown when clicking elsewhere on screen ---- */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.note-card-top-actions') && !e.target.closest('.folder-card-top-actions')) {
      document.querySelectorAll('.note-dropdown-menu.active').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });

  /* ======================================================
     FOLDER CARD CLICK HANDLING
     ====================================================== */
  function handleFolderCardClick(e) {
    const toggleBtn = e.target.closest('[data-action="toggle-folder-menu"]');
    if (toggleBtn) {
      e.stopPropagation();
      const dropdown = toggleBtn.parentElement.querySelector('.note-dropdown-menu');

      document.querySelectorAll('.note-dropdown-menu.active').forEach(menu => {
        if (menu !== dropdown) menu.classList.remove('active');
      });

      const isOpening = !dropdown.classList.contains('active');
      dropdown.classList.toggle('active');

      if (isOpening) {
        const btnRect = toggleBtn.getBoundingClientRect();
        const dropdownHeight = dropdown.offsetHeight || 100;
        const spaceBelow = window.innerHeight - btnRect.bottom;

        if (spaceBelow < dropdownHeight + 80) {
          dropdown.style.top = (btnRect.top - dropdownHeight - 4) + 'px';
        } else {
          dropdown.style.top = (btnRect.bottom + 4) + 'px';
        }
        dropdown.style.left = (btnRect.right - dropdown.offsetWidth) + 'px';
      }
      return;
    }

    const addNotesBtn = e.target.closest('[data-action="folder-add-notes"]');
    if (addNotesBtn) {
      e.stopPropagation();
      document.querySelectorAll('.note-dropdown-menu.active').forEach(menu => menu.classList.remove('active'));
      showNoteChecklist(addNotesBtn.dataset.id).then((saved) => {
        if (saved) {
          renderFoldersPage();
          showToast('Folder updated', 'success');
        }
      });
      return;
    }

    const renameBtn = e.target.closest('[data-action="folder-rename"]');
    if (renameBtn) {
      e.stopPropagation();
      const folder = getAllFolders().find(f => f.id === renameBtn.dataset.id);
      showPrompt('Rename this folder', {
        title: 'Rename Folder',
        defaultValue: folder ? folder.name : '',
        confirmText: 'Rename'
      }).then((newName) => {
        if (newName) {
          renameFolder(renameBtn.dataset.id, newName);
          renderFoldersPage();
          showToast('Folder renamed', 'success');
        }
      });
      return;
    }

    const deleteBtn = e.target.closest('[data-action="folder-delete"]');
    if (deleteBtn) {
      e.stopPropagation();
      showConfirm('Delete this folder? Notes inside will not be deleted, just unfiled.', {
        title: 'Delete Folder?',
        confirmText: 'Delete'
      }).then((confirmed) => {
        if (confirmed) {
          const notesInFolder = getAllNotes().filter(n => n.folderId === deleteBtn.dataset.id);
          notesInFolder.forEach(n => updateNoteById(n.id, { folderId: null }));
          deleteFolder(deleteBtn.dataset.id);
          renderFoldersPage();
          showToast('Folder deleted', 'danger');
        }
      });
      return;
    }

    const card = e.target.closest('.folder-card');
    if (card && !e.target.closest('.folder-card-top-actions')) {
      openFolder(card.dataset.id);
    }
  }

  const foldersGrid = document.getElementById('foldersGrid');
  if (foldersGrid) {
    foldersGrid.addEventListener('click', handleFolderCardClick);
  }

  const backToFoldersBtn = document.getElementById('backToFoldersBtn');
  if (backToFoldersBtn) {
    backToFoldersBtn.addEventListener('click', () => {
      currentFilter = 'all';
      currentFolderId = null;
      showPage('folders');
    });
  }

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
    editingNoteId = null;
    titleInput.value = '';
    bodyInput.value = '';
    populateFolderSelect('');
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
    const folderId = document.getElementById('noteFolderSelect').value || null;

    if (!title && !body) {
      modal.classList.remove('active');
      return;
    }

    let savedNoteId;
    if (editingNoteId) {
      updateNoteById(editingNoteId, { title: title || 'Untitled', body, folderId });
      savedNoteId = editingNoteId;
      showToast('Note updated', 'success');
    } else {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newNote = createNote({ title: title || 'Untitled', body, color: randomColor, folderId });
      savedNoteId = newNote.id;
      showToast('Note saved', 'success');
    }

    editingNoteId = null;
    modal.classList.remove('active');
    renderCounts();
    patchNoteCard(savedNoteId);
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
