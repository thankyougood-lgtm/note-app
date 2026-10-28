/* ==========================================================================
   DIALOGS — Custom confirm() and toast() replacements
   ========================================================================== */

function showConfirm(message, options = {}) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmOverlay');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');

    titleEl.textContent = options.title || 'Are you sure?';
    messageEl.textContent = message;
    okBtn.textContent = options.confirmText || 'Confirm';

    overlay.classList.add('active');

    function cleanup(result) {
      overlay.classList.remove('active');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      resolve(result);
    }

    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast active' + (type ? ' ' + type : '');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('active');
  }, 2500);
}
function showPrompt(message, options = {}) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('promptOverlay');
    const titleEl = document.getElementById('promptTitle');
    const input = document.getElementById('promptInput');
    const okBtn = document.getElementById('promptOkBtn');
    const cancelBtn = document.getElementById('promptCancelBtn');

    titleEl.textContent = options.title || 'Enter a name';
    input.value = options.defaultValue || '';
    okBtn.textContent = options.confirmText || 'Create';

    overlay.classList.add('active');
    setTimeout(() => input.focus(), 50);

    function cleanup(result) {
      overlay.classList.remove('active');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      input.removeEventListener('keydown', onKeydown);
      resolve(result);
    }

    function onOk() {
      const value = input.value.trim();
      cleanup(value || null);
    }
    function onCancel() { cleanup(null); }
    function onKeydown(e) {
      if (e.key === 'Enter') onOk();
      if (e.key === 'Escape') onCancel();
    }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    input.addEventListener('keydown', onKeydown);
  });
}
