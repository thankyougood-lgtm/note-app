/* ==========================================================================
   STORAGE — Handles reading/writing notes to localStorage
   This is the ONLY file that talks to localStorage directly.
   ========================================================================== */

const STORAGE_KEY = 'noteapp_notes';

function getStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read notes from storage:', err);
    if (typeof showToast === 'function') {
      showToast('Could not load notes. Data may be corrupted.', 'danger');
    }
    return [];
  }
}

function setStorage(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (err) {
    console.error('Failed to save notes to storage:', err);
    if (typeof showToast === 'function') {
      if (err.name === 'QuotaExceededError') {
        showToast('Storage full! Delete some notes or export your data.', 'danger');
      } else {
        showToast('Failed to save. Your change may not persist.', 'danger');
      }
    }
    return false;
  }
}
