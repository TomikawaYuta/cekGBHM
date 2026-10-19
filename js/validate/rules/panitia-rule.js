import { fuzzyMatch } from '../similarity.js';

function findMasterPanitia(nama, jabatan, masterPanitias) {
  for (const master of masterPanitias) {
    const namaMatch = fuzzyMatch(
      String(nama ?? '').toLowerCase().trim(),
      String(master.nama ?? '').toLowerCase().trim(),
      90,
    );
    const jabatanMatch = fuzzyMatch(
      String(jabatan ?? '').toLowerCase().trim(),
      String(master.jabatan ?? '').toLowerCase().trim(),
      90,
    );
    if (namaMatch && jabatanMatch) return master;
  }
  return null;
}

export function checkPanitiaRule(profile, masterPanitias) {
  const errors = [];
  const nama = profile.nama_lengkap ?? '';
  const jabatan = profile.jabatan ?? '';
  const challenge = profile.challenge ?? '';

  const master = findMasterPanitia(nama, jabatan, masterPanitias);
  if (!master) {
    errors.push(`Panitia "${nama}" dengan jabatan "${jabatan}" tidak ditemukan di database Panitia`);
    return errors;
  }

  if (challenge) {
    const validChallenges = [master.challenge_1, master.challenge_2, master.challenge_3]
      .map((c) => String(c ?? '').toLowerCase());
    const isChallengeValid = validChallenges.some((vc) => fuzzyMatch(String(challenge).toLowerCase(), vc, 90));

    if (!isChallengeValid) {
      errors.push(`Challenge yang diinputkan tidak terdaftar untuk Panitia ${nama}`);
    }
  }

  return errors;
}
