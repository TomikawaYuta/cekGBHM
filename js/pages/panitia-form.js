import { GBHMStore } from '../store.js';
import { qs, showAlert, initNav } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  await GBHMStore.init();

  const id = qs('id');
  const form = document.getElementById('panitiaForm');
  const alertBox = document.getElementById('alertBox');
  const titleEl = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');

  const fields = ['nama', 'nim', 'jabatan', 'challenge_1', 'challenge_2', 'challenge_3'];

  if (id) {
    const data = GBHMStore.getPanitiaById(id);
    if (!data) {
      showAlert(alertBox, 'error', 'Data tidak ditemukan');
      return;
    }
    titleEl.textContent = 'Edit Panitia';
    submitBtn.textContent = 'Update';
    fields.forEach((f) => {
      form.elements[f].value = data[f] || '';
    });
  } else {
    titleEl.textContent = 'Tambah Panitia';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';

    const data = {};
    fields.forEach((f) => { data[f] = form.elements[f].value.trim(); });

    try {
      GBHMStore.savePanitia(data, id || null);
      window.location.href = `panitia.html?msg=${encodeURIComponent(id ? 'Data panitia berhasil diupdate' : 'Data panitia berhasil ditambahkan')}`;
    } catch (err) {
      showAlert(alertBox, 'error', err.message);
    }
  });
});
