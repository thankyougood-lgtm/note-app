// ================================================
// 🔑 STEP 1: Grab our HTML Elements
// ================================================
const addBtn      = document.getElementById('add-btn');
const noteTitleInput = document.getElementById('note-title');
const noteBodyInput  = document.getElementById('note-body');
const notesGrid      = document.getElementById('notes-grid');

// ================================================
// 🔑 STEP 2: Load notes when the page opens
// ================================================
document.addEventListener('DOMContentLoaded', loadNotes);

// ================================================
// 🔑 STEP 3: Listen for Add Button click
// ================================================
addBtn.addEventListener('click', addNote);

// ================================================
// 📌 FUNCTION 1: addNote()
// ================================================
function addNote() {
  const title = noteTitleInput.value.trim();
  const body  = noteBodyInput.value.trim();

  // Guard: don't add empty notes
  //if (title === '' || body === '') {
    //alert('⚠️ Please fill in both title and note!');
   // return;
 // }

  // Create a note object
  const note = {
    id: Date.now(),
    title: title,
    body: body,
  };

  // Save to localStorage
  saveToLocalStorage(note);

  // Show it on screen
  renderNote(note);

  // Clear the inputs
  noteTitleInput.value = '';
  noteBodyInput.value  = '';
}

// ================================================
// 📌 FUNCTION 2: renderNote(note)
// ================================================
function renderNote(note) {
  // Remove empty message if it exists
  const emptyMsg = document.querySelector('.empty-msg');
  if (emptyMsg) emptyMsg.remove();

  // Create card element
  const card = document.createElement('div');
  card.classList.add('note-card');
  card.setAttribute('data-id', note.id);

  card.innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.body}</p>
    <button class="delete-btn" onclick="deleteNote(${note.id})">🗑 Delete</button>
  `;

  notesGrid.appendChild(card);
}

// ================================================
// 📌 FUNCTION 3: saveToLocalStorage(note)
// ================================================
function saveToLocalStorage(note) {
  // Get existing notes (or empty array if none)
  const notes = getNotesFromStorage();

  // Add the new note
  notes.push(note);

  // Save back to localStorage
  localStorage.setItem('myNotes', JSON.stringify(notes));
}

// ================================================
// 📌 FUNCTION 4: getNotesFromStorage()
// ================================================
function getNotesFromStorage() {
  const stored = localStorage.getItem('myNotes');
  return stored ? JSON.parse(stored) : [];
}

// ================================================
// 📌 FUNCTION 5: loadNotes()
// ================================================
function loadNotes() {
  const notes = getNotesFromStorage();

  if (notes.length === 0) {
    notesGrid.innerHTML = '<p class="empty-msg">No notes yet! Add one ☝️</p>';
    return;
  }

  notes.forEach(function(note) {
    renderNote(note);
  });
}

// ================================================
// 📌 FUNCTION 6: deleteNote(id)
// ================================================
function deleteNote(id) {
  // Remove from screen
  const card = document.querySelector(`[data-id="${id}"]`);
  card.remove();

  // Remove from localStorage
  let notes = getNotesFromStorage();
  notes = notes.filter(function(note) {
    return note.id !== id;
  });

  localStorage.setItem('myNotes', JSON.stringify(notes));

  // Show empty message if no notes left
  if (notesGrid.children.length === 0) {
    notesGrid.innerHTML = '<p class="empty-msg">No notes yet! Add one ☝️</p>';
  }
}