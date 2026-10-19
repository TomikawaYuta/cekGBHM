/**
 * Helper bersama untuk semua halaman.
 */
export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())} ${bulan[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function statusPill(status) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-800';
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
  return `<span class="px-2 py-1 text-xs rounded-full ${cls}">${escapeHtml(label)}</span>`;
}

export function showAlert(container, type, message) {
  if (!container) return;
  const cls = type === 'error'
    ? 'bg-red-100 border-red-400 text-red-700'
    : 'bg-green-100 border-green-400 text-green-700';
  container.innerHTML = `<div class="${cls} border px-4 py-3 rounded mb-4">${escapeHtml(message)}</div>`;
}

export function showFlashFromQuery(container) {
  const params = new URLSearchParams(window.location.search);
  const msg = params.get('msg');
  if (msg) {
    showAlert(container, params.get('type') || 'success', msg);
    const url = new URL(window.location.href);
    url.searchParams.delete('msg');
    url.searchParams.delete('type');
    window.history.replaceState({}, '', url);
  }
}

export function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Highlight nav aktif berdasarkan body[data-page].
 */
export function initNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll(`[data-nav="${page}"]`).forEach((el) => {
    el.classList.add('bg-indigo-50', 'text-indigo-600');
    el.classList.remove('text-gray-600');
  });
}

document.addEventListener('DOMContentLoaded', initNav);
