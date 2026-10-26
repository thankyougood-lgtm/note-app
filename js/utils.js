/* ===== Small helper tools used by many files ===== */

// Find one element, like $("#btn-add")
export const $ = (sel) => document.querySelector(sel);

// Make text safe to place inside HTML
export function esc(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// "Today, 9:32 AM", "Yesterday, 7:42 PM", or "Aug 12, 2025"
export function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = 86400000;
  if (d >= startToday) return `Today, ${time}`;
  if (d >= startToday - day) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}