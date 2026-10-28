/* ==========================================================================
   STORAGE — Handles reading/writing notes to localStorage
   This is the ONLY file that talks to localStorage directly.
   ========================================================================== */

const STORAGE_KEY = 'noteapp_notes';

function getStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function setStorage(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}