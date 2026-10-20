import { GBHMStore } from '../store.js';
import { escapeHtml, showFlashFromQuery, initNav } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  const ready = await GBHMStore.init();
  if (ready === false) return;
  showFlashFromQuery(document.getElementById('alertBox'));

  const searchInput = document.getElementById('searchInput');

  function render() {
    const admin = GBHMStore.isAdmin();
    const q = searchInput.value.toLowerCase().trim();
    let list = GBHMStore.getPanitia();
    if (q) {
      list = list.filter((p) => p.nama.toLowerCase().includes(q)
        || p.nim.toLowerCase().includes(q)
        || p.jabatan.toLowerCase().includes(q));
    }

    const tbody = document.getElementById('panitiaBody');
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data panitia</td></tr>';
      return;
    }

    tbody.innerHTML = list.map((p) => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(p.nama)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(p.nim)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(p.jabatan)}</td>
        <td class="px-6 py-4 text-sm text-gray-500">
          <ul class="list-disc list-inside">
            <li>${escapeHtml(p.challenge_1)}</li>
            <li>${escapeHtml(p.challenge_2)}</li>
            <li>${escapeHtml(p.challenge_3)}</li>
          </ul>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
          ${admin
            ? `<a href="panitia-form.html?id=${encodeURIComponent(p.id)}" class="text-indigo-600 hover:text-indigo-900">Edit</a>
               <button type="button" data-delete="${encodeURIComponent(p.id)}" class="text-red-600 hover:text-red-900">Hapus</button>`
            : '<span class="text-gray-400">-</span>'}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (window.confirm('Yakin hapus?')) {
          try {
            await GBHMStore.deletePanitia(btn.dataset.delete);
            window.location.href = 'panitia.html?msg=' + encodeURIComponent('Data panitia berhasil dihapus');
          } catch (err) {
            window.alert(err.message);
          }
        }
      });
    });
  }

  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    render();
  });
  searchInput.addEventListener('input', render);

  render();
  GBHMStore.subscribe((name) => {
    if (name === 'panitia') render();
  });
});
