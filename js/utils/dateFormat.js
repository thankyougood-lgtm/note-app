/* ==========================================================================
   DATE FORMAT — Turns a timestamp into "Oct 26, 2026"
   ========================================================================== */

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}