/**
 * Port PHP similar_text() → JavaScript.
 *
 * Algoritma (sama dengan php-src ext/standard/string.c):
 * 1. Cari longest common substring (LCS) — panjang max, posisi pos1/pos2
 *    (scanning p1 luar, p2 dalam, pertama dengan panjang max strict >).
 * 2. similar += max
 * 3. Recurse pada bagian sebelum LCS dan sesudah LCS.
 * persen = similar * 200 / (len(str1) + len(str2))
 */

function longestCommonSubstring(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;
  let max = 0;
  let pos1 = 0;
  let pos2 = 0;

  for (let p1 = 0; p1 < len1; p1 += 1) {
    for (let p2 = 0; p2 < len2; p2 += 1) {
      let l = 0;
      while (p1 + l < len1 && p2 + l < len2 && s1[p1 + l] === s2[p2 + l]) {
        l += 1;
      }
      if (l > max) {
        max = l;
        pos1 = p1;
        pos2 = p2;
      }
    }
  }

  return { max, pos1, pos2 };
}

function similarCount(s1, s2) {
  if (s1.length === 0 || s2.length === 0) return 0;

  const { max, pos1, pos2 } = longestCommonSubstring(s1, s2);
  if (max === 0) return 0;

  const before = similarCount(s1.slice(0, pos1), s2.slice(0, pos2));
  const after = similarCount(
    s1.slice(pos1 + max),
    s2.slice(pos2 + max),
  );

  return max + before + after;
}

/**
 * @returns {{ similar: number, percent: number }}
 */
export function similarText(str1, str2) {
  const s1 = String(str1 ?? '');
  const s2 = String(str2 ?? '');
  const similar = similarCount(s1, s2);
  const total = s1.length + s2.length;
  const percent = total > 0 ? (similar * 200) / total : 0;
  return { similar, percent };
}

export function fuzzyMatch(str1, str2, threshold = 90) {
  const a = String(str1 ?? '');
  const b = String(str2 ?? '');
  if (a === b) return true;
  const { percent } = similarText(a, b);
  return percent >= threshold;
}
