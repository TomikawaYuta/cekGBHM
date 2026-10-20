import { GBHMStore } from '../store.js';
import { formatSize, formatDate, escapeHtml, statusPill, showAlert, initNav } from '../main.js';
import { extractPdf } from '../extract/pdf-extract.js';
import { validate } from '../validate/engine.js';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

async function renderHistory() {
  const sessions = GBHMStore.getSessions();
  const tbody = document.getElementById('historyBody');

  if (!sessions.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Belum ada upload</td></tr>';
    return;
  }

  tbody.innerHTML = sessions.map((s) => `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHtml(s.filename)}</td>
      <td class="px-6 py-4 whitespace-nowrap">${statusPill(s.status)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(formatDate(s.uploadedAt))}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        ${s.status === 'completed'
          ? `<a href="result.html?id=${encodeURIComponent(s.id)}" class="text-indigo-600 hover:text-indigo-900">Lihat Hasil</a>`
          : s.status === 'failed'
            ? `<span class="text-red-600 text-sm">${escapeHtml(s.errorMessage || 'Gagal')}</span>`
            : '<span class="text-gray-400">Memproses...</span>'}
      </td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  const ready = await GBHMStore.init();
  if (ready === false) return;
  renderHistory();

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('pdf_file');
  const browseBtn = document.getElementById('browseBtn');
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const removeFile = document.getElementById('removeFile');
  const submitBtn = document.getElementById('submitBtn');
  const uploadForm = document.getElementById('uploadForm');
  const alertBox = document.getElementById('alertBox');

  let selectedFile = null;

  browseBtn.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-indigo-500', 'bg-indigo-50');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-indigo-500', 'bg-indigo-50');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-indigo-500', 'bg-indigo-50');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  removeFile.addEventListener('click', () => {
    fileInput.value = '';
    selectedFile = null;
    filePreview.classList.add('hidden');
    submitBtn.disabled = true;
    alertBox.innerHTML = '';
  });

  function handleFile(file) {
    alertBox.innerHTML = '';
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showAlert(alertBox, 'error', 'Hanya file PDF yang diizinkan');
      return;
    }
    if (file.size > MAX_SIZE) {
      showAlert(alertBox, 'error', `File terlalu besar (maksimal ${formatSize(MAX_SIZE)})`);
      return;
    }
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatSize(file.size);
    filePreview.classList.remove('hidden');
    submitBtn.disabled = false;
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';
    alertBox.innerHTML = '';

    try {
      const extraction = await extractPdf(selectedFile);
      let session;

      if (!extraction.success) {
        session = GBHMStore.addSession({
          filename: selectedFile.name,
          status: 'failed',
          errorMessage: extraction.error,
          extractedData: null,
          results: [],
        });
      } else {
        const minKata = GBHMStore.getMinKata('first_impression');
        const results = validate(
          extraction.data,
          GBHMStore.getPanitia(),
          GBHMStore.getQuests(),
          minKata,
        );
        session = GBHMStore.addSession({
          filename: selectedFile.name,
          status: 'completed',
          extractedData: extraction.data,
          results,
        });
      }

      window.location.href = `result.html?id=${encodeURIComponent(session.id)}`;
    } catch (err) {
      console.error(err);
      showAlert(alertBox, 'error', `Terjadi kesalahan: ${err.message}`);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Upload & Validasi';
    }
  });
});
