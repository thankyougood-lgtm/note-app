/* ==========================================================================
   GENERATE ID — Creates a unique ID for each note
   ========================================================================== */

function generateId() {
  return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}