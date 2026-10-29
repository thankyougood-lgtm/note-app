/* ==========================================================================
   EXPORT — Export notes as DOC or PDF
   ========================================================================== */

function exportNotesAsDoc() {
  const notes = getActiveNotes();
  if (notes.length === 0) {
    showToast('No notes to export yet.', 'danger');
  }

  const notesHtml = notes.map(note => `
    <h2>${escapeHtml(note.title)}</h2>
    <p style="color:#888; font-size:12px;">${formatDate(note.createdAt)}</p>
    <p>${escapeHtml(note.body).replace(/\n/g, '<br>')}</p>
    <hr>
  `).join('');

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset="utf-8"><title>My Notes</title></head>
    <body>
      <h1>My Notes</h1>
      ${notesHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes-${new Date().toISOString().split('T')[0]}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportNotesAsPdf() {
  const notes = getActiveNotes();
  if (notes.length === 0) {
        showToast('No notes to export yet.', 'danger');
  }

  let printArea = document.getElementById('printArea');
  if (!printArea) {
    printArea = document.createElement('div');
    printArea.id = 'printArea';
    document.body.appendChild(printArea);
  }

  printArea.innerHTML = `
    <h1>My Notes</h1>
    ${notes.map(note => `
      <div class="print-note">
        <h2>${escapeHtml(note.title)}</h2>
        <p class="print-date">${formatDate(note.createdAt)}</p>
        <p>${escapeHtml(note.body).replace(/\n/g, '<br>')}</p>
      </div>
    `).join('<hr>')}
  `;

  window.print();
}

function exportSingleNoteAsPdf(id) {
  const notes = getAllNotes();
  const note = notes.find(n => n.id === id);
  if (!note) return;

  let printArea = document.getElementById('printArea');
  if (!printArea) {
    printArea = document.createElement('div');
    printArea.id = 'printArea';
    document.body.appendChild(printArea);
  }

  printArea.innerHTML = `
    <div class="print-note">
      <h2>${escapeHtml(note.title)}</h2>
      <p class="print-date">${formatDate(note.createdAt)}</p>
      <p>${escapeHtml(note.body).replace(/\n/g, '<br>')}</p>
    </div>
  `;

  window.print();
}

function exportSingleNoteAsDoc(id) {
  const notes = getAllNotes();
  const note = notes.find(n => n.id === id);
  if (!note) return;

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset="utf-8"><title>${escapeHtml(note.title)}</title></head>
    <body>
      <h1>${escapeHtml(note.title)}</h1>
      <p style="color:#888; font-size:12px;">${formatDate(note.createdAt)}</p>
      <p>${escapeHtml(note.body).replace(/\n/g, '<br>')}</p>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (note.title || 'note').replace(/[^a-z0-9]/gi, '_');
  a.href = url;
  a.download = `${safeName}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
