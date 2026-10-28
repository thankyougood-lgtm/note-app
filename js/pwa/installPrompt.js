/* ==========================================================================
   INSTALL PROMPT — Custom "Add to Home Screen" handling
   ========================================================================== */

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  // Only create it once
  if (document.getElementById('installBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'installBtn';
  btn.textContent = '📲 Install App';
  btn.style.cssText = `
    position: fixed;
    bottom: calc(var(--bottom-nav-height) + 80px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: var(--shadow-fab);
    z-index: 999;
  `;

  btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install outcome:', outcome);
    deferredPrompt = null;
    btn.remove();
  });

  document.body.appendChild(btn);
}

window.addEventListener('appinstalled', () => {
  console.log('✅ App installed successfully');
  const btn = document.getElementById('installBtn');
  if (btn) btn.remove();
});