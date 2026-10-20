import { GBHMStore } from '../store.js';
import { escapeHtml, showFlashFromQuery, initNav } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  const ready = await GBHMStore.init();
  if (ready === false) return;
  showFlashFromQuery(document.getElementById('alertBox'));

  function render() {
    const admin = GBHMStore.isAdmin();
    const list = GBHMStore.getRules();
    const tbody = document.getElementById('rulesBody');

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Tidak ada rules</td></tr>';
      return;
    }

    tbody.innerHTML = list.map((r) => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(r.rule_type)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(r.min_kata)} kata</td>
        <td class="px-6 py-4 text-sm text-gray-500">${escapeHtml(r.deskripsi)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
          ${admin
            ? `<a href="rules-form.html?id=${encodeURIComponent(r.id)}" class="text-indigo-600 hover:text-indigo-900">Edit</a>
               <button type="button" data-delete="${encodeURIComponent(r.id)}" class="text-red-600 hover:text-red-900">Hapus</button>`
            : '<span class="text-gray-400">-</span>'}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (window.confirm('Yakin hapus?')) {
          try {
            await GBHMStore.deleteRule(btn.dataset.delete);
            window.location.href = 'rules.html?msg=' + encodeURIComponent('Rule berhasil dihapus');
          } catch (err) {
            window.alert(err.message);
          }
        }
      });
    });
  }

  render();
  GBHMStore.subscribe((name) => {
    if (name === 'rules') render();
  });
});
