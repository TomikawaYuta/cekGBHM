import { GBHMStore } from '../store.js';
import { qs, showAlert, initNav } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  const ready = await GBHMStore.init();
  if (ready === false) return;

  if (!GBHMStore.isAdmin()) {
    window.location.href = 'quest.html';
    return;
  }

  const id = qs('id');
  const form = document.getElementById('questForm');
  const alertBox = document.getElementById('alertBox');
  const titleEl = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');

  if (id) {
    const data = GBHMStore.getQuestById(id);
    if (!data) {
      showAlert(alertBox, 'error', 'Data tidak ditemukan');
      return;
    }
    titleEl.textContent = 'Edit Quest';
    submitBtn.textContent = 'Update';
    form.elements.chapter.value = data.chapter;
    form.elements.angkatan.value = data.angkatan || '';
    form.elements.jenis_quest.value = data.jenis_quest || '';
    form.elements.deskripsi.value = data.deskripsi || '';
    form.elements.target_jumlah.value = data.target_jumlah || '';
  } else {
    titleEl.textContent = 'Tambah Quest';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';

    const data = {
      chapter: Number(form.elements.chapter.value),
      angkatan: form.elements.angkatan.value.trim(),
      jenis_quest: form.elements.jenis_quest.value.trim(),
      deskripsi: form.elements.deskripsi.value.trim(),
      target_jumlah: Number(form.elements.target_jumlah.value),
    };

    try {
      await GBHMStore.saveQuest(data, id || null);
      window.location.href = `quest.html?msg=${encodeURIComponent(id ? 'Data quest berhasil diupdate' : 'Data quest berhasil ditambahkan')}`;
    } catch (err) {
      showAlert(alertBox, 'error', err.message);
    }
  });
});
