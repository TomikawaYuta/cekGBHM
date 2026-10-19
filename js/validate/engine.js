import { checkPanitia as completenessPanitia, checkAngkatan as completenessAngkatan } from './rules/completeness.js';
import { checkTextLength } from './rules/text-length.js';
import { checkNimFormat } from './rules/nim-format.js';
import { checkNimDuplicates, checkIdenticalProfiles } from './rules/duplicate.js';
import { checkPanitiaRule } from './rules/panitia-rule.js';
import { checkAngkatanCount, checkQuestMatch } from './rules/quest-rule.js';

function createResult(profilType, profilName, pageNumber, profilData, status, errors) {
  return {
    profil_type: profilType,
    profil_name: profilName,
    page_number: pageNumber,
    profil_data: profilData,
    status,
    errors: errors && errors.length ? errors : null,
    details: null,
  };
}

function validateCover(cover) {
  const errors = [];
  if (!cover.nama_lengkap_pemilik) errors.push('Data Nama Lengkap Pemilik kosong');
  if (!cover.nama_kelompok) errors.push('Data Nama Kelompok kosong');

  return createResult(
    'cover',
    cover.nama_lengkap_pemilik || 'Cover',
    1,
    cover,
    errors.length ? 'tidak_lolos' : 'lolos',
    errors,
  );
}

function validatePanitiaProfiles(profiles, masterPanitias, minKata) {
  return profiles.map((profile) => {
    const errors = [
      ...completenessPanitia(profile),
      ...checkTextLength(profile, minKata),
      ...checkPanitiaRule(profile, masterPanitias),
    ];

    return createResult(
      'panitia',
      profile.nama_lengkap || 'Tanpa Nama',
      profile.page_number ?? 0,
      profile,
      errors.length ? 'tidak_lolos' : 'lolos',
      errors,
    );
  });
}

function validateAngkatanProfiles(profiles, masterQuests, minKata) {
  return profiles.map((profile) => {
    const errors = [
      ...completenessAngkatan(profile),
      ...checkTextLength(profile, minKata),
      ...checkNimFormat(profile),
      ...checkQuestMatch(profile, masterQuests),
    ];

    return createResult(
      'angkatan',
      profile.nama_lengkap || 'Tanpa Nama',
      profile.page_number ?? 0,
      profile,
      errors.length ? 'tidak_lolos' : 'lolos',
      errors,
    );
  });
}

/**
 * @param {object} extractedData - { cover, panitia[], angkatan[], warnings[] }
 * @param {object[]} masterPanitias
 * @param {object[]} masterQuests
 * @param {number} minKata
 * @returns {object[]} array hasil validasi per profil + row agregat
 */
export function validate(extractedData, masterPanitias, masterQuests, minKata = 3) {
  const allResults = [];

  if (extractedData.cover) {
    allResults.push(validateCover(extractedData.cover));
  }

  if (extractedData.panitia && extractedData.panitia.length) {
    allResults.push(...validatePanitiaProfiles(extractedData.panitia, masterPanitias, minKata));
  }

  if (extractedData.angkatan && extractedData.angkatan.length) {
    allResults.push(...validateAngkatanProfiles(extractedData.angkatan, masterQuests, minKata));

    const duplicateNimErrors = checkNimDuplicates(extractedData.angkatan);
    const duplicateIdenticalErrors = checkIdenticalProfiles(extractedData.angkatan);
    const globalDuplicateErrors = [...duplicateNimErrors, ...duplicateIdenticalErrors];
    if (globalDuplicateErrors.length) {
      allResults.push(createResult('angkatan', 'Validasi Duplikasi Global', 0, [], 'tidak_lolos', globalDuplicateErrors));
    }

    const countErrors = checkAngkatanCount(extractedData.angkatan, masterQuests);
    if (countErrors.length) {
      allResults.push(createResult('angkatan', 'Validasi Jumlah Profil', 0, [], 'tidak_lolos', countErrors));
    }
  }

  return allResults;
}
