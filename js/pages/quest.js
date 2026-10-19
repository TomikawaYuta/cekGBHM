import { GBHMStore } from '../store.js';
import { escapeHtml, showFlashFromQuery, initNav } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  await GBHMStore.init();
  showFlashFromQuery(document.getElementById('alertBox'));

  const chapterSelect = document.getElementById('chapterFilter');
  const angkatanSelect = document.getElementById('angkatanFilter');

  // Isi dropdown angkatan dari data
  const angkatans = [...new Set(GBHMStore.getQuests().map((q) => q.angkatan))].sort();
  angkatanSelect.innerHTML = '<option value="">Semua Angkatan</option>'
    + angkatans.map((a) => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');

  function render() {
    const chapter = chapterSelect.value;
    const angkatan = angkatanSelect.value;
    let list = GBHMStore.getQuests();

    if (chapter) list = list.filter((q) => String(q.chapter) === chapter);
    if (angkatan) list = list.filter((q) => q.angkatan === angkatan);

    const tbody = document.getElementById('questBody');
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data quest</td></tr>';
      return;
    }

    tbody.innerHTML = list.map((q) => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHtml(q.chapter)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(q.angkatan)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(q.jenis_quest)}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${escapeHtml(q.deskripsi)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(q.target_jumlah)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
          <a href="quest-form.html?id=${encodeURIComponent(q.id)}" class="text-indigo-600 hover:text-indigo-900">Edit</a>
          <button type="button" data-delete="${encodeURIComponent(q.id)}" class="text-red-600 hover:text-red-900">Hapus</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.confirm('Yakin hapus?')) {
          GBHMStore.deleteQuest(btn.dataset.delete);
          window.location.href = 'quest.html?msg=' + encodeURIComponent('Data quest berhasil dihapus');
        }
      });
    });
  }

  chapterSelect.addEventListener('change', render);
  angkatanSelect.addEventListener('change', render);

  render();
});
