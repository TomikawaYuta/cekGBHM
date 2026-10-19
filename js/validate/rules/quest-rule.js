import { fuzzyMatch } from '../similarity.js';

function extractAngkatan(nim) {
  const nimStr = String(nim ?? '');
  if (nimStr.length >= 4 && /^\d+$/.test(nimStr)) {
    return nimStr.slice(0, 4);
  }
  return null;
}

function getTargetForAngkatan(angkatan, masterQuests) {
  const quest = masterQuests.find(
    (q) => String(q.angkatan) === String(angkatan) && q.jenis_quest === 'profil_kating',
  );
  return quest ? Number(quest.target_jumlah) : null;
}

export function checkAngkatanCount(angkatanProfiles, masterQuests) {
  const errors = [];
  const profilesByAngkatan = new Map();

  for (const profile of angkatanProfiles) {
    const angkatan = extractAngkatan(profile.nim);
    if (angkatan) {
      if (!profilesByAngkatan.has(angkatan)) profilesByAngkatan.set(angkatan, []);
      profilesByAngkatan.get(angkatan).push(profile);
    }
  }

  for (const [angkatan, profiles] of profilesByAngkatan) {
    const count = profiles.length;
    const target = getTargetForAngkatan(angkatan, masterQuests);

    if (target !== null) {
      if (count > target) {
        errors.push(`Jumlah profil Angkatan ${angkatan} melebihi target (${count}/${target}, hapus ${count - target} profil)`);
      } else if (count < target) {
        errors.push(`Jumlah profil Angkatan ${angkatan} kurang dari target (${count}/${target}, tambahkan ${target - count} profil)`);
      }
    }
  }

  const panitiaCount = angkatanProfiles.length;
  if (panitiaCount > 34) {
    errors.push(`Jumlah profil Panitia melebihi batas (${panitiaCount}/34)`);
  } else if (panitiaCount < 34) {
    errors.push(`Jumlah profil Panitia kurang dari target (${panitiaCount}/34)`);
  }

  return errors;
}

export function checkQuestMatch(profile, masterQuests) {
  const errors = [];
  const quest = profile.quest ?? '';
  const nim = profile.nim ?? '';

  if (!quest || !nim) return errors;

  const angkatan = extractAngkatan(nim);
  if (!angkatan) return errors;

  const validQuests = masterQuests.filter((q) => String(q.angkatan) === String(angkatan));

  let isQuestValid = false;
  for (const validQuest of validQuests) {
    if (fuzzyMatch(String(quest).toLowerCase(), String(validQuest.jenis_quest).toLowerCase(), 80)) {
      isQuestValid = true;
      break;
    }
    if (fuzzyMatch(String(quest).toLowerCase(), String(validQuest.deskripsi).toLowerCase(), 70)) {
      isQuestValid = true;
      break;
    }
  }

  if (!isQuestValid) {
    errors.push(`Quest "${quest}" tidak sesuai dengan Master Quest untuk Angkatan ${angkatan}`);
  }

  return errors;
}
