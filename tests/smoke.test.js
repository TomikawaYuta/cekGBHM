/**
 * Smoke test Node — memverifikasi port rule validasi & similarity
 * terhadap perilaku PHP similar_text() asli.
 * Jalankan: node tests/smoke.test.js
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { similarText, fuzzyMatch } from '../js/validate/similarity.js';
import { checkPanitia, checkAngkatan } from '../js/validate/rules/completeness.js';
import { checkTextLength } from '../js/validate/rules/text-length.js';
import { checkNimFormat } from '../js/validate/rules/nim-format.js';
import { checkNimDuplicates, checkIdenticalProfiles } from '../js/validate/rules/duplicate.js';
import { checkPanitiaRule } from '../js/validate/rules/panitia-rule.js';
import { checkAngkatanCount, checkQuestMatch } from '../js/validate/rules/quest-rule.js';
import { validate } from '../js/validate/engine.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('similarity.js — dibandingkan dengan PHP similar_text():');
test('identical strings → 100%', () => {
  const { percent } = similarText('membuat presentasi', 'membuat presentasi');
  assert.equal(percent, 100);
});
test('abc|abc → similar 3, 100%', () => {
  const { similar, percent } = similarText('abc', 'abc');
  assert.equal(similar, 3);
  assert.equal(percent, 100);
});
test('abcdef|abcxyz → similar 3, 50%', () => {
  const { similar, percent } = similarText('abcdef', 'abcxyz');
  assert.equal(similar, 3);
  assert.equal(percent, 50);
});
test('profil kating|profil_kating → ~92.3%', () => {
  const { percent } = similarText('profil kating', 'profil_kating');
  assert.ok(Math.abs(percent - 92.307692307692) < 0.0001, `got ${percent}`);
});
test('temukan 15 teman baru|teman → ~38.46%', () => {
  const { similar, percent } = similarText('temukan 15 teman baru', 'teman');
  assert.equal(similar, 5);
  assert.ok(Math.abs(percent - 38.461538461538) < 0.0001, `got ${percent}`);
});
test('tempat|tempatzzz → 80%', () => {
  const { percent } = similarText('tempat', 'tempatzzz');
  assert.equal(percent, 80);
});
test('ketua umum|koordinator acara → similar 3, ~22.2%', () => {
  const { similar, percent } = similarText('ketua umum', 'koordinator acara');
  assert.equal(similar, 3);
  assert.ok(Math.abs(percent - 22.222222222222) < 0.0001, `got ${percent}`);
});
test('fuzzyMatch threshold', () => {
  assert.equal(fuzzyMatch('profil kating', 'profil_kating', 90), true);
  assert.equal(fuzzyMatch('ketua umum', 'koordinator acara', 90), false);
  assert.equal(fuzzyMatch('abc', 'abc', 90), true);
});

console.log('completeness.js:');
test('panitia lengkap → no errors', () => {
  const errors = checkPanitia({
    nama_lengkap: 'X', jabatan: 'Y', challenge: 'Z',
    first_impression: 'a b c', paling_berkesan: 'd e f', has_photo: true,
  });
  assert.deepEqual(errors, []);
});
test('panitia kosong → errors', () => {
  const errors = checkPanitia({});
  assert.ok(errors.length >= 6); // 5 field + foto
  assert.ok(errors.some((e) => e.includes('Nama Lengkap')));
  assert.ok(errors.some((e) => e.includes('Pas foto')));
});
test('angkatan lengkap → no errors', () => {
  const errors = checkAngkatan({
    nim: '20261234567', nama_lengkap: 'X', tempat_tanggal_lahir: 'Y',
    quest: 'Z', jawaban_quest: 'W', first_impression: 'a b c',
    paling_berkesan: 'd e f', has_photo: true,
  });
  assert.deepEqual(errors, []);
});

console.log('text-length.js:');
test('2 kata → error', () => {
  const errors = checkTextLength({ first_impression: 'sangat bagus', paling_berkesan: 'sangat berkesan' }, 3);
  assert.equal(errors.length, 2);
  assert.ok(errors[0].includes('hanya 2 kata'));
});
test('3 kata dengan tanda baca → ok', () => {
  const errors = checkTextLength({ first_impression: 'sangat, bagus! sekali', paling_berkesan: 'pengalaman yang indah' }, 3);
  assert.deepEqual(errors, []);
});

console.log('nim-format.js:');
test('NIM 11 digit → ok', () => {
  assert.deepEqual(checkNimFormat({ nim: '20261234567' }), []);
});
test('NIM 9 digit → error', () => {
  const errors = checkNimFormat({ nim: '202612345' });
  assert.ok(errors[0].includes('berjumlah 9'));
});
test('NIM non-digit → error', () => {
  const errors = checkNimFormat({ nim: '2026123456a' });
  assert.ok(errors[0].includes('angka'));
});

console.log('duplicate.js:');
test('NIM duplikat terdeteksi', () => {
  const errors = checkNimDuplicates([
    { nim: '20261234567', page_number: 2 },
    { nim: '20261234567', page_number: 3 },
  ]);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes('halaman 3'));
  assert.ok(errors[0].includes('halaman 2'));
});
test('profil identik terdeteksi', () => {
  const p = { nama_lengkap: 'Budi', nim: '20261234567', first_impression: 'a b c', paling_berkesan: 'd e f', page_number: 2 };
  const errors = checkIdenticalProfiles([p, { ...p, page_number: 3 }]);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes('copy-paste'));
});

console.log('panitia-rule.js:');
const masterPanitia = [
  { nama: 'Ahmad Fauzi', jabatan: 'Ketua Umum', challenge_1: 'Membuat presentasi', challenge_2: 'Memimpin rapat', challenge_3: 'Mengkoordinasi acara' },
];
test('panitia match + challenge valid → ok', () => {
  const errors = checkPanitiaRule(
    { nama_lengkap: 'Ahmad Fauzi', jabatan: 'Ketua Umum', challenge: 'Membuat presentasi' },
    masterPanitia,
  );
  assert.deepEqual(errors, []);
});
test('panitia tidak ditemukan → error', () => {
  const errors = checkPanitiaRule({ nama_lengkap: 'Zzz', jabatan: 'Yyy', challenge: 'X' }, masterPanitia);
  assert.ok(errors[0].includes('tidak ditemukan'));
});
test('challenge salah → error', () => {
  const errors = checkPanitiaRule(
    { nama_lengkap: 'Ahmad Fauzi', jabatan: 'Ketua Umum', challenge: 'Makan nasi goreng' },
    masterPanitia,
  );
  assert.ok(errors[0].includes('tidak terdaftar'));
});

console.log('quest-rule.js:');
const masterQuests = [
  { chapter: 1, angkatan: '2026', jenis_quest: 'teman', deskripsi: 'Temukan 15 teman baru', target_jumlah: 15 },
  { chapter: 2, angkatan: '2025', jenis_quest: 'profil_kating', deskripsi: 'Profil mahasiswa angkatan 2025', target_jumlah: 2 },
];
test('quest match jenis_quest → ok', () => {
  const errors = checkQuestMatch({ quest: 'teman', nim: '20261234567' }, masterQuests);
  assert.deepEqual(errors, []);
});
test('quest salah → error', () => {
  const errors = checkQuestMatch({ quest: 'makan bakso', nim: '20261234567' }, masterQuests);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes('tidak sesuai'));
});
test('jumlah profil vs target', () => {
  const profiles = [
    { nim: '20251234567' },
    { nim: '20251234568' },
    { nim: '20251234569' },
  ];
  const errors = checkAngkatanCount(profiles, masterQuests);
  // target 2025 = 2, ada 3 → melebihi; panitia count 3 < 34
  assert.ok(errors.some((e) => e.includes('melebihi target (3/2')));
  assert.ok(errors.some((e) => e.includes('kurang dari target (3/34)')));
});

console.log('engine.js — integrasi:');
const extractedData = {
  cover: { nama_lengkap_pemilik: 'Budi', nama_kelompok: 'Kelompok 1' },
  panitia: [
    {
      page_number: 2, nama_lengkap: 'Ahmad Fauzi', jabatan: 'Ketua Umum',
      challenge: 'Membuat presentasi', first_impression: 'sangat seru sekali',
      paling_berkesan: 'pengalaman yang berkesan', has_photo: true,
    },
  ],
  angkatan: [
    {
      page_number: 3, nim: '20251234567', nama_lengkap: 'Siti',
      tempat_tanggal_lahir: 'Jakarta, 1 Jan 2007', quest: 'profil_kating',
      jawaban_quest: 'jawaban panjang', first_impression: 'sangat seru sekali',
      paling_berkesan: 'pengalaman yang berkesan', has_photo: true,
    },
    {
      page_number: 4, nim: '20251234568', nama_lengkap: 'Dewi',
      tempat_tanggal_lahir: 'Bandung, 2 Feb 2007', quest: 'profil_kating',
      jawaban_quest: 'jawaban panjang', first_impression: 'sangat seru sekali',
      paling_berkesan: 'pengalaman yang berkesan', has_photo: true,
    },
  ],
  warnings: [],
};
const masterQuestsFull = [
  { chapter: 2, angkatan: '2025', jenis_quest: 'profil_kating', deskripsi: 'Profil mahasiswa angkatan 2025', target_jumlah: 2 },
];
test('validasi → cover lolos, panitia lolos', () => {
  const results = validate(extractedData, masterPanitia, masterQuestsFull, 3);
  const cover = results.find((r) => r.profil_type === 'cover');
  assert.equal(cover.status, 'lolos');
  const panitia = results.find((r) => r.profil_type === 'panitia');
  assert.equal(panitia.status, 'lolos');
});
test('validasi → jumlah profil 2025 = 2 sesuai target, tapi total angkatan < 34', () => {
  const results = validate(extractedData, masterPanitia, masterQuestsFull, 3);
  const count = results.find((r) => r.profil_name === 'Validasi Jumlah Profil');
  assert.equal(count.status, 'tidak_lolos');
  assert.ok(count.errors.some((e) => e.includes('34')));
});
test('validasi → angkatan lolos (quest & NIM ok)', () => {
  const results = validate(extractedData, masterPanitia, masterQuestsFull, 3);
  const angkatan = results.filter((r) => r.profil_type === 'angkatan' && r.profil_name !== 'Validasi Duplikasi Global' && r.profil_name !== 'Validasi Jumlah Profil');
  assert.equal(angkatan.length, 2);
  for (const a of angkatan) assert.equal(a.status, 'lolos');
});

console.log('static check — modul ES (js/**):');

const JS_ROOT = fileURLToPath(new URL('../js', import.meta.url));

function walkJs(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walkJs(path);
    return path.endsWith('.js') ? [path] : [];
  });
}

function isBare(spec) {
  return !/^(\.\/|\.\.\/|\/|https?:|data:|node:)/.test(spec);
}

test('semua import specifier URL absolut / path relatif (tanpa bare specifier)', () => {
  const offenders = [];
  for (const file of walkJs(JS_ROOT)) {
    const src = readFileSync(file, 'utf8');
    const specs = [
      ...src.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g),
      ...src.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm),
    ].map((m) => m[1]);
    for (const spec of specs) {
      if (isBare(spec)) offenders.push(`${file.replace(/\\/g, '/')}: ${spec}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `import bare specifier tidak bisa di-resolve browser:\n      ${offenders.join('\n      ')}`,
  );
});

test('tidak ada nama binding import yang duplikat dalam satu file', () => {
  const offenders = [];
  for (const file of walkJs(JS_ROOT)) {
    const src = readFileSync(file, 'utf8');
    const locals = [];
    for (const m of src.matchAll(/\bimport\s*\{([^}]*)\}\s*from\s*['"][^'"]+['"]/g)) {
      for (const part of m[1].split(',')) {
        const name = part.trim();
        if (!name) continue;
        locals.push(name.includes(' as ') ? name.split(/\s+as\s+/).pop() : name);
      }
    }
    const dup = locals.filter((name, i) => locals.indexOf(name) !== i);
    if (dup.length) offenders.push(`${file.replace(/\\/g, '/')}: ${[...new Set(dup)].join(', ')}`);
  }
  assert.deepEqual(
    offenders,
    [],
    `nama binding import duplikat (SyntaxError di browser):\n      ${offenders.join('\n      ')}`,
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
