/**
 * Port PdfExtractionService + TextExtractor + ImageExtractor + DataMapper ke JS.
 * Teks: pdf.js. Deteksi foto: heuristik regex atas raw bytes PDF (sama seperti versi PHP).
 */
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

// ---------- Text extraction (pdf.js) ----------

async function extractPageTexts(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Kelompokkan items berdasarkan y (transform[5]) → baris
    const lines = [];
    for (const item of content.items) {
      if (!item.str) continue;
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      const last = lines[lines.length - 1];
      if (last && Math.abs(last.y - y) <= 2) {
        last.parts.push({ x, str: item.str });
      } else {
        lines.push({ y, parts: [{ x, str: item.str }] });
      }
    }

    // Susun teks per baris (urutkan parts berdasarkan x)
    const text = lines
      .map((line) => line.parts.sort((a, b) => a.x - b.x).map((p) => p.str).join(' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n');

    pageTexts.push({ page_number: i, text });
  }

  return pageTexts;
}

function isScannedPdf(pageTexts) {
  for (const page of pageTexts) {
    const text = page.text.trim();
    if (text.length > 50) return false;
  }
  return true;
}

// ---------- Image detection (raw bytes heuristic, port ImageExtractor) ----------

function bytesToLatin1(bytes) {
  // Chunk agar tidak stack overflow untuk PDF besar
  const chunkSize = 0x8000;
  let result = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    result += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return result;
}

function extractImageInfo(bytes) {
  const content = bytesToLatin1(bytes);

  const imageMatches = content.match(/\/Subtype\s*\/Image/g);
  const imageCount = imageMatches ? imageMatches.length : 0;

  const pageCountMatch = content.match(/\/Count\s+(\d+)/);
  const pageCount = pageCountMatch ? parseInt(pageCountMatch[1], 10) : 1;

  const estimatedPerPage = pageCount > 0 ? Math.ceil(imageCount / pageCount) : 0;

  return {
    total_images: imageCount,
    page_count: pageCount,
    estimated_per_page: estimatedPerPage,
    has_images: imageCount > 0,
  };
}

function hasPhotoOnPage(content, pageNumber) {
  const pages = content.split('/Type /Page');
  if (pages[pageNumber] !== undefined) {
    const pageContent = pages[pageNumber];
    const matches = pageContent.match(/\/Subtype\s*\/Image/g);
    return !!matches && matches.length > 0;
  }
  return false;
}

// ---------- Data mapping (port DataMapper) ----------

function extractLines(text) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

function isLabelLine(line) {
  const labels = ['nama', 'nim', 'jabatan', 'challenge', 'quest', 'first impression',
    'paling berkesan', 'tempat', 'tanggal lahir', 'jawaban', 'foto'];
  const lower = String(line).toLowerCase().trim();
  return labels.some((label) => lower.includes(label) && lower.length < 50);
}

function cleanValue(value) {
  return String(value).trim().replace(/\s+/g, ' ');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findField(lines, labels) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lowerLine = line.toLowerCase();

    for (const label of labels) {
      if (lowerLine.includes(label.toLowerCase())) {
        const patterns = [
          new RegExp(`${escapeRegex(label)}\\s*[:\\-–]\\s*(.+)`, 'i'),
          new RegExp(`${escapeRegex(label)}\\s+(.+)`, 'i'),
        ];

        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match) return cleanValue(match[1]);
        }

        // Jika tidak ada nilai di baris yang sama, cek baris berikutnya
        const nextLine = lines[index + 1];
        if (nextLine && nextLine.trim() && !isLabelLine(nextLine)) {
          return cleanValue(nextLine);
        }
      }
    }
  }
  return null;
}

function mapCover(text) {
  const lines = extractLines(text);
  const namaLengkap = findField(lines, ['nama lengkap pemilik', 'nama pemilik', 'nama']);
  const namaKelompok = findField(lines, ['nama kelompok', 'kelompok']);

  if (!namaLengkap && !namaKelompok) return null;

  return {
    nama_lengkap_pemilik: namaLengkap,
    nama_kelompok: namaKelompok,
  };
}

function isPanitiaPage(text) {
  const lower = text.toLowerCase();
  return lower.includes('jabatan') || lower.includes('panitia') || lower.includes('challenge');
}

function isAngkatanPage(text) {
  const lower = text.toLowerCase();
  return lower.includes('nim')
    || lower.includes('angkatan')
    || lower.includes('tempat')
    || lower.includes('tanggal lahir')
    || lower.includes('quest');
}

function mapPanitiaProfile(text, pageNumber) {
  const lines = extractLines(text);
  return {
    page_number: pageNumber,
    nama_lengkap: findField(lines, ['nama lengkap', 'nama']),
    jabatan: findField(lines, ['jabatan']),
    challenge: findField(lines, ['challenge']),
    first_impression: findField(lines, ['first impression', 'kesan pertama']),
    paling_berkesan: findField(lines, ['paling berkesan', 'apa yang paling berkesan']),
    has_photo: false,
  };
}

function mapAngkatanProfile(text, pageNumber) {
  const lines = extractLines(text);
  return {
    page_number: pageNumber,
    nim: findField(lines, ['nim', 'nomor induk mahasiswa']),
    nama_lengkap: findField(lines, ['nama lengkap', 'nama']),
    tempat_tanggal_lahir: findField(lines, ['tempat, tanggal lahir', 'tempat', 'tanggal lahir', 'ttl']),
    quest: findField(lines, ['quest']),
    jawaban_quest: findField(lines, ['jawaban quest', 'jawaban']),
    first_impression: findField(lines, ['first impression', 'kesan pertama']),
    paling_berkesan: findField(lines, ['paling berkesan', 'apa yang paling berkesan']),
    has_photo: false,
  };
}

function mapData(pageTexts) {
  const result = {
    cover: null,
    panitia: [],
    angkatan: [],
    warnings: [],
  };

  if (!pageTexts.length) {
    result.warnings.push('Tidak ada teks yang dapat diekstrak dari PDF');
    return result;
  }

  result.cover = mapCover(pageTexts[0]?.text || '');

  for (let i = 1; i < pageTexts.length; i += 1) {
    const text = pageTexts[i].text;
    const pageNumber = pageTexts[i].page_number;

    if (isPanitiaPage(text)) {
      result.panitia.push(mapPanitiaProfile(text, pageNumber));
    } else if (isAngkatanPage(text)) {
      result.angkatan.push(mapAngkatanProfile(text, pageNumber));
    } else {
      result.warnings.push(`Halaman ${pageNumber} tidak dikenali sebagai profil Panitia atau Angkatan`);
    }
  }

  return result;
}

// ---------- Orchestrator (port PdfExtractionService) ----------

/**
 * @param {File} file
 * @returns {Promise<{success: boolean, error: string|null, data: object|null}>}
 */
export async function extractPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // 1. Ekstrak teks
    const pageTexts = await extractPageTexts(arrayBuffer);

    // 2. Cek scanned PDF
    if (isScannedPdf(pageTexts)) {
      return {
        success: false,
        error: 'Teks tidak dapat dibaca, pastikan PDF bukan hasil scan/gambar',
        data: null,
      };
    }

    // 3. Info gambar dari raw bytes
    const imageInfo = extractImageInfo(bytes);
    const rawContent = bytesToLatin1(bytes);

    // 4. Map ke struktur data
    const mappedData = mapData(pageTexts);

    // 5. Enrich dengan deteksi foto per halaman
    for (const panitia of mappedData.panitia) {
      panitia.has_photo = hasPhotoOnPage(rawContent, panitia.page_number);
    }
    for (const angkatan of mappedData.angkatan) {
      angkatan.has_photo = hasPhotoOnPage(rawContent, angkatan.page_number);
    }

    mappedData.image_info = imageInfo;

    return { success: true, error: null, data: mappedData };
  } catch (err) {
    console.error('PDF extraction error:', err);
    return {
      success: false,
      error: err && err.message ? `Gagal memproses PDF: ${err.message}` : 'Gagal memproses PDF',
      data: null,
    };
  }
}
