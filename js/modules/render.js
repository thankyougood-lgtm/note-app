

/* ==========================================================================
   RENDER — Builds the HTML for notes and injects it into the page
   ========================================================================== */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function createNoteCardHTML(note) {
  const preview = note.body
    ? note.body.substring(0, 60) + (note.body.length > 60 ? '...' : '')
    : 'No additional text';

  return `
    <div class="note-card bg-${note.color}" data-id="${note.id}">
      <div class="note-card-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 2H14L19 7V20C19 21.1 18.1 22 17 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z" fill="white"/>
        </svg>
      </div>
      <div class="note-card-content">
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <p class="note-preview">${escapeHtml(preview)}</p>
        <div class="note-date">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
</svg>
          <span>${formatDate(note.createdAt)}</span>
        </div>
      </div>
      <button class="note-card-menu" data-action="menu" data-id="${note.id}">⋯</button>
      <button class="note-card-star" data-action="favorite" data-id="${note.id}">
        ${note.isFavorite ? '⭐' : ''}
      </button>
    </div>
  `;
}

function renderNotesList(notes) {
  const container = document.getElementById('notesList');
  const emptyState = document.getElementById('emptyState');

  container.querySelectorAll('.note-card').forEach(el => el.remove());

  if (notes.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    notes.forEach(note => {
      container.insertAdjacentHTML('beforeend', createNoteCardHTML(note));
    });
  }
}

function renderCounts() {
  const counts = getCounts();
  document.getElementById('countAll').textContent = counts.all;
  document.getElementById('countFavorites').textContent = counts.favorites;
  document.getElementById('countTrash').textContent = counts.trash;
  document.getElementById('countFolders').textContent = counts.folders;
}
function renderNotesListFull(notes) {
  const container = document.getElementById('notesListFull');
  const emptyState = document.getElementById('emptyStateFull');

  container.querySelectorAll('.note-card').forEach(el => el.remove());

  if (notes.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    notes.forEach(note => {
      container.insertAdjacentHTML('beforeend', createNoteCardHTML(note));
    });
  }
}

function createFolderCardHTML(folder) {
  return `
    <div class="folder-card" data-id="${folder.id}">
      <div class="folder-card-icon">📁</div>
      <div class="folder-card-info">
        <h3 class="folder-name">${escapeHtml(folder.name)}</h3>
        <span class="folder-count">0 notes</span>
      </div>
      <button class="folder-card-menu" data-action="folder-delete" data-id="${folder.id}">⋯</button>
    </div>
  `;
}

function renderFoldersPage() {
  const grid = document.getElementById('foldersGrid');
  const folders = getAllFolders();

  grid.querySelectorAll('.folder-card').forEach(el => el.remove());
  const emptyMsg = grid.querySelector('.empty-state');

  if (folders.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
  } else {
    if (emptyMsg) emptyMsg.style.display = 'none';
    folders.forEach(folder => {
      grid.insertAdjacentHTML('beforeend', createFolderCardHTML(folder));
    });
  }
}
