function normalize(value) {
  return String(value ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function checkNimDuplicates(profiles) {
  const errors = [];
  const nimMap = new Map();

  for (const profile of profiles) {
    const nim = profile.nim || null;
    const pageNumber = profile.page_number ?? '?';

    if (nim) {
      if (nimMap.has(nim)) {
        errors.push(`NIM ${nim} terindikasi duplikat pada halaman ${pageNumber} (sama dengan halaman ${nimMap.get(nim)})`);
      } else {
        nimMap.set(nim, pageNumber);
      }
    }
  }

  return errors;
}

export function checkIdenticalProfiles(profiles) {
  const errors = [];
  const signatureMap = new Map();

  for (const profile of profiles) {
    const pageNumber = profile.page_number ?? '?';
    const fields = [
      profile.nama_lengkap ?? '',
      profile.nim ?? '',
      profile.first_impression ?? '',
      profile.paling_berkesan ?? '',
    ];
    const signature = fields.map(normalize).join('|');

    if (signatureMap.has(signature)) {
      errors.push(`Data profil pada halaman ${pageNumber} identik dengan halaman ${signatureMap.get(signature)} (indikasi copy-paste)`);
    } else {
      signatureMap.set(signature, pageNumber);
    }
  }

  return errors;
}
