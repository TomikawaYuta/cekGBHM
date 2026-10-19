export function checkNimFormat(profile, expectedLength = 11) {
  const errors = [];
  const nim = profile.nim;

  if (!nim) return errors;

  const nimStr = String(nim);
  if (!/^\d+$/.test(nimStr)) {
    errors.push('NIM tidak valid, harus berupa angka');
  } else if (nimStr.length !== expectedLength) {
    errors.push(`NIM kurang lengkap hanya berjumlah ${nimStr.length} bukan ${expectedLength}`);
  }

  return errors;
}
