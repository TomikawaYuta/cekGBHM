import { GBHMStore } from '../store.js';
import { formatDate, escapeHtml, initNav } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  const ready = await GBHMStore.init();
  if (ready === false) return;

  const params = new URLSearchParams(window.location.search);
  const searchInput = document.getElementById('searchInput');
  if (params.get('search')) searchInput.value = params.get('search');

  function render() {
    const q = searchInput.value.toLowerCase().trim();
    const sessions = GBHMStore.getSessions().filter((s) => s.status === 'completed');
    const filtered = q
      ? sessions.filter((s) => s.filename.toLowerCase().includes(q))
      : sessions;

    const tbody = document.getElementById('resultsBody');
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Tidak ada hasil validasi</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map((s) => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(s.filename)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(formatDate(s.uploadedAt))}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <a href="result.html?id=${encodeURIComponent(s.id)}" class="text-indigo-600 hover:text-indigo-900">Lihat Detail</a>
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    render();
  });
  searchInput.addEventListener('input', render);

  render();
});
