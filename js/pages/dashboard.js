import { GBHMStore } from '../store.js';
import { formatDate, escapeHtml, statusPill } from '../main.js';

function render() {
  const stats = GBHMStore.getStats();

  document.getElementById('statPanitia').textContent = stats.totalPanitia;
  document.getElementById('statQuest').textContent = stats.totalQuest;
  document.getElementById('statUpload').textContent = stats.totalUploads;
  document.getElementById('statLolos').textContent = stats.lolos;
  document.getElementById('statTidakLolos').textContent = stats.tidakLolos;

  const tbody = document.getElementById('recentBody');
  if (!stats.recentUploads.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Belum ada upload</td></tr>';
    return;
  }

  tbody.innerHTML = stats.recentUploads.map((s) => `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHtml(s.filename)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
      <td class="px-6 py-4 whitespace-nowrap">${statusPill(s.status)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(formatDate(s.uploadedAt))}</td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  const ready = await GBHMStore.init();
  if (ready === false) return;
  render();
  // Realtime: statistik ikut berubah saat master data diubah di browser lain
  GBHMStore.subscribe(render);
});
