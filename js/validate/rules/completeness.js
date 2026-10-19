const PANITIA_FIELDS = ['nama_lengkap', 'jabatan', 'challenge', 'first_impression', 'paling_berkesan'];
const ANGKATAN_FIELDS = ['nim', 'nama_lengkap', 'tempat_tanggal_lahir', 'quest', 'jawaban_quest', 'first_impression', 'paling_berkesan'];

const FIELD_NAMES = {
  nama_lengkap: 'Nama Lengkap',
  jabatan: 'Jabatan',
  challenge: 'Challenge',
  first_impression: 'First Impression',
  paling_berkesan: 'Apa yang paling berkesan',
  nim: 'NIM',
  tempat_tanggal_lahir: 'Tempat, Tanggal Lahir',
  quest: 'Quest',
  jawaban_quest: 'Jawaban Quest',
};

function isEmpty(value) {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

export function checkPanitia(profile) {
  const errors = [];
  for (const field of PANITIA_FIELDS) {
    if (isEmpty(profile[field])) {
      errors.push(`Data ${FIELD_NAMES[field] || field} kosong`);
    }
  }
  if (isEmpty(profile.has_photo)) {
    errors.push('Pas foto tidak ditemukan');
  }
  return errors;
}

export function checkAngkatan(profile) {
  const errors = [];
  for (const field of ANGKATAN_FIELDS) {
    if (isEmpty(profile[field])) {
      errors.push(`Data ${FIELD_NAMES[field] || field} kosong`);
    }
  }
  if (isEmpty(profile.has_photo)) {
    errors.push('Pas foto tidak ditemukan');
  }
  return errors;
}
