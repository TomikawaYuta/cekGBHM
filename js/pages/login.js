import { login, friendlyAuthError, onAuthChange } from '../auth.js';
import { showAlert } from '../main.js';
import { FIREBASE_CONFIGURED } from '../firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const alertBox = document.getElementById('alertBox');
  const submitBtn = document.getElementById('submitBtn');

  // Sudah login (sesi tersimpan / setelah berhasil masuk) → ke dashboard.
  onAuthChange((user) => {
    if (user) window.location.href = 'index.html';
  });

  if (!FIREBASE_CONFIGURED) {
    showAlert(alertBox, 'error', 'Konfigurasi Firebase belum diisi. Buka README → Setup Firebase, lalu isi js/firebase-config.js.');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memeriksa...';

    try {
      await login(form.elements.username.value, form.elements.password.value);
      window.location.href = 'index.html';
    } catch (err) {
      showAlert(alertBox, 'error', friendlyAuthError(err));
      submitBtn.disabled = false;
      submitBtn.textContent = 'Masuk';
    }
  });
});
