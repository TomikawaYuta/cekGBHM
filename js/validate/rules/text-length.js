function countWords(text) {
  const stripped = String(text).replace(/[^\p{L}\p{N}_\s]/gu, '').trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

export function checkTextLength(profile, minWords = 3) {
  const errors = [];

  if (profile.first_impression) {
    const wordCount = countWords(profile.first_impression);
    if (wordCount < minWords) {
      errors.push(`First Impression hanya ${wordCount} kata, minimal ${minWords} kata`);
    }
  }

  if (profile.paling_berkesan) {
    const wordCount = countWords(profile.paling_berkesan);
    if (wordCount < minWords) {
      errors.push(`Apa yang paling berkesan hanya ${wordCount} kata, minimal ${minWords} kata`);
    }
  }

  return errors;
}
