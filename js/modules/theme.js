/* ==========================================================================
   THEME — Dark/Light mode handling
   ========================================================================== */

const THEME_KEY = 'noteapp_theme';

function applyThemeColor(isDark) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', isDark ? '#121212' : '#4C7EF3');
  }
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const isDark = saved === 'dark';

  if (isDark) {
    document.body.classList.add('dark-mode');
  }
  applyThemeColor(isDark);

  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    toggle.checked = isDark;
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  applyThemeColor(isDark);
}

function resetTheme() {
  document.body.classList.remove('dark-mode');
  applyThemeColor(false);
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = false;
}