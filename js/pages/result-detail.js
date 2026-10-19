import { GBHMStore } from '../store.js';
import { escapeHtml, initNav } from '../main.js';

function escapeAttr(value) {
  return escapeHtml(value ?? '-');
}

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  await GBHMStore.init();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('content');

  if (!id) {
    container.innerHTML = '<div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">ID hasil tidak ditemukan. <a href="results.html" class="text-indigo-600">Kembali ke daftar hasil</a></div>';
    return;
  }

  const session = GBHMStore.getSession(id);
  if (!session) {
    container.innerHTML = '<div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">Hasil tidak ditemukan. <a href="results.html" class="text-indigo-600">Kembali ke daftar hasil</a></div>';
    return;
  }

  // Header filename
  document.getElementById('sessionFilename').textContent = session.filename;

  if (session.status === 'failed') {
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-xl font-semibold text-gray-800">Hasil Validasi</h1>
            <p class="text-sm text-gray-500 mt-1">${escapeHtml(session.filename)}</p>
          </div>
          <a href="results.html" class="text-indigo-600 hover:text-indigo-800">&larr; Kembali</a>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="font-medium text-red-800 mb-2">Proses Gagal</h3>
          <p class="text-sm text-red-700">${escapeHtml(session.errorMessage || 'Terjadi kesalahan saat memproses PDF.')}</p>
        </div>
        <div class="mt-4">
          <a href="upload.html" class="text-indigo-600 hover:text-indigo-800">&larr; Kembali ke Upload</a>
        </div>
      </div>`;
    return;
  }

  const results = session.results || [];
  const extracted = session.extractedData || {};
  const summary = {
    total: results.length,
    lolos: results.filter((r) => r.status === 'lolos').length,
    tidak_lolos: results.filter((r) => r.status === 'tidak_lolos').length,
  };
  const warnings = extracted.warnings || [];

  const summaryHtml = `
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <p class="text-2xl font-bold text-gray-800">${summary.total}</p>
        <p class="text-sm text-gray-500">Total Profil</p>
      </div>
      <div class="bg-green-50 rounded-lg p-4 text-center">
        <p class="text-2xl font-bold text-green-600">${summary.lolos}</p>
        <p class="text-sm text-green-700">Lolos</p>
      </div>
      <div class="bg-red-50 rounded-lg p-4 text-center">
        <p class="text-2xl font-bold text-red-600">${summary.tidak_lolos}</p>
        <p class="text-sm text-red-700">Tidak Lolos</p>
      </div>
    </div>`;

  const warningsHtml = warnings.length ? `
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 class="font-medium text-yellow-800 mb-2">Peringatan:</h3>
      <ul class="list-disc list-inside text-sm text-yellow-700">
        ${warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('')}
      </ul>
    </div>` : '';

  const resultRows = results.length ? results.map((r) => {
    const detail = r.errors && r.errors.length
      ? `<ul class="list-disc list-inside text-red-600 space-y-1">${r.errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`
      : '<span class="text-green-600">Semua validasi passed</span>';
    const statusBadge = r.status === 'lolos'
      ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Lolos Pengecekan</span>'
      : '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Tidak Lolos</span>';
    return `
      <tr class="${r.status === 'tidak_lolos' ? 'bg-red-50' : ''}">
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${r.page_number || '-'}</td>
        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${escapeHtml(r.profil_type ? r.profil_type.charAt(0).toUpperCase() + r.profil_type.slice(1) : '-')}</td>
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${escapeHtml(r.profil_name)}</td>
        <td class="px-4 py-3 whitespace-nowrap">${statusBadge}</td>
        <td class="px-4 py-3 text-sm">${detail}</td>
      </tr>`;
  }).join('') : `
    <tr>
      <td colspan="5" class="px-4 py-4 text-center text-sm text-gray-500">Tidak ada hasil validasi</td>
    </tr>`;

  const resultsTableHtml = `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Halaman</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">${resultRows}</tbody>
      </table>
    </div>`;

  // Extracted data section
  let extractedHtml = '';
  if (extracted && (extracted.cover || (extracted.panitia && extracted.panitia.length) || (extracted.angkatan && extracted.angkatan.length))) {
    let inner = '';

    if (extracted.cover) {
      inner += `
        <div>
          <h3 class="font-medium text-gray-800 mb-2">Cover</h3>
          <div class="bg-gray-50 rounded p-4 text-sm">
            <p><span class="text-gray-500">Nama Pemilik:</span> ${escapeAttr(extracted.cover.nama_lengkap_pemilik)}</p>
            <p><span class="text-gray-500">Nama Kelompok:</span> ${escapeAttr(extracted.cover.nama_kelompok)}</p>
          </div>
        </div>`;
    }

    if (extracted.panitia && extracted.panitia.length) {
      inner += `
        <div>
          <h3 class="font-medium text-gray-800 mb-2">Panitia (${extracted.panitia.length} profil)</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Hal</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Jabatan</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Challenge</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Foto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${extracted.panitia.map((p) => `
                  <tr>
                    <td class="px-3 py-2 text-gray-500">${escapeAttr(p.page_number)}</td>
                    <td class="px-3 py-2 font-medium">${escapeAttr(p.nama_lengkap)}</td>
                    <td class="px-3 py-2 text-gray-500">${escapeAttr(p.jabatan)}</td>
                    <td class="px-3 py-2 text-gray-500">${escapeAttr(p.challenge)}</td>
                    <td class="px-3 py-2">
                      ${p.has_photo
                        ? '<span class="text-green-600">✓ Ada</span>'
                        : '<span class="text-red-600">✗ Tidak</span>'}
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (extracted.angkatan && extracted.angkatan.length) {
      inner += `
        <div>
          <h3 class="font-medium text-gray-800 mb-2">Angkatan (${extracted.angkatan.length} profil)</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Hal</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">NIM</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">TTL</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Quest</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Foto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${extracted.angkatan.map((a) => `
                  <tr>
                    <td class="px-3 py-2 text-gray-500">${escapeAttr(a.page_number)}</td>
                    <td class="px-3 py-2 font-mono">${escapeAttr(a.nim)}</td>
                    <td class="px-3 py-2 font-medium">${escapeAttr(a.nama_lengkap)}</td>
                    <td class="px-3 py-2 text-gray-500">${escapeAttr(a.tempat_tanggal_lahir)}</td>
                    <td class="px-3 py-2 text-gray-500">${escapeAttr(a.quest)}</td>
                    <td class="px-3 py-2">
                      ${a.has_photo
                        ? '<span class="text-green-600">✓ Ada</span>'
                        : '<span class="text-red-600">✗ Tidak</span>'}
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    extractedHtml = `
      <div class="bg-white rounded-lg shadow mt-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800">Data Hasil Ekstraksi</h2>
        </div>
        <div class="p-6 space-y-6">${inner}</div>
      </div>`;
  }

  container.innerHTML = `
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-xl font-semibold text-gray-800">Hasil Validasi</h1>
            <p class="text-sm text-gray-500 mt-1">${escapeHtml(session.filename)}</p>
          </div>
          <a href="results.html" class="text-indigo-600 hover:text-indigo-800">&larr; Kembali</a>
        </div>
      </div>
      <div class="p-6">
        ${summaryHtml}
        ${warningsHtml}
        ${resultsTableHtml}
      </div>
    </div>
    ${extractedHtml}`;
});
