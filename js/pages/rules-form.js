import { GBHMStore } from '../store.js';
import { qs, showAlert, initNav } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  const ready = await GBHMStore.init();
  if (ready === false) return;

  if (!GBHMStore.isAdmin()) {
    window.location.href = 'rules.html';
    return;
  }

  const id = qs('id');
  const form = document.getElementById('ruleForm');
  const alertBox = document.getElementById('alertBox');
  const titleEl = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');

  if (id) {
    const data = GBHMStore.getRuleById(id);
    if (!data) {
      showAlert(alertBox, 'error', 'Data tidak ditemukan');
      return;
    }
    titleEl.textContent = 'Edit Rule';
    submitBtn.textContent = 'Update';
    form.elements.rule_type.value = data.rule_type || '';
    form.elements.min_kata.value = data.min_kata || 3;
    form.elements.deskripsi.value = data.deskripsi || '';
  } else {
    titleEl.textContent = 'Tambah Rule';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';

    const data = {
      rule_type: form.elements.rule_type.value,
      min_kata: Number(form.elements.min_kata.value),
      deskripsi: form.elements.deskripsi.value.trim(),
    };

    try {
      await GBHMStore.saveRule(data, id || null);
      window.location.href = `rules.html?msg=${encodeURIComponent(id ? 'Rule berhasil diupdate' : 'Rule berhasil ditambahkan')}`;
    } catch (err) {
      showAlert(alertBox, 'error', err.message);
    }
  });
});
