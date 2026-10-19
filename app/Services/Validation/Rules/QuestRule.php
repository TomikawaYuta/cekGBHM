<?php

namespace App\Services\Validation\Rules;

use App\Models\Quest;

class QuestRule
{
    public function checkAngkatanCount(array $angkatanProfiles, array $masterQuests): array
    {
        $errors = [];

        // Group by angkatan
        $profilesByAngkatan = [];
        foreach ($angkatanProfiles as $profile) {
            $angkatan = $this->extractAngkatan($profile['nim'] ?? '');
            if ($angkatan) {
                $profilesByAngkatan[$angkatan][] = $profile;
            }
        }

        // Check count against master quest targets
        foreach ($profilesByAngkatan as $angkatan => $profiles) {
            $count = count($profiles);
            $target = $this->getTargetForAngkatan($angkatan, $masterQuests);

            if ($target !== null) {
                if ($count > $target) {
                    $errors[] = "Jumlah profil Angkatan {$angkatan} melebihi target ({$count}/{$target}, hapus " . ($count - $target) . " profil)";
                } elseif ($count < $target) {
                    $errors[] = "Jumlah profil Angkatan {$angkatan} kurang dari target ({$count}/{$target}, tambahkan " . ($target - $count) . " profil)";
                }
            }
        }

        // Check panitia count (expected 34)
        $panitiaCount = $this->countPanitia($angkatanProfiles);
        if ($panitiaCount > 34) {
            $errors[] = "Jumlah profil Panitia melebihi batas ({$panitiaCount}/34)";
        } elseif ($panitiaCount < 34) {
            $errors[] = "Jumlah profil Panitia kurang dari target ({$panitiaCount}/34)";
        }

        return $errors;
    }

    public function checkQuestMatch(array $profile, array $masterQuests): array
    {
        $errors = [];

        $quest = $profile['quest'] ?? '';
        $nim = $profile['nim'] ?? '';

        if (empty($quest) || empty($nim)) {
            return $errors;
        }

        $angkatan = $this->extractAngkatan($nim);
        if (!$angkatan) {
            return $errors;
        }

        // Find valid quest for this angkatan
        $validQuests = array_filter($masterQuests, function ($q) use ($angkatan) {
            return $q->angkatan === $angkatan;
        });

        $isQuestValid = false;
        foreach ($validQuests as $validQuest) {
            if ($this->fuzzyMatch(strtolower($quest), strtolower($validQuest->jenis_quest), 80)) {
                $isQuestValid = true;
                break;
            }
            // Also check against description
            if ($this->fuzzyMatch(strtolower($quest), strtolower($validQuest->deskripsi), 70)) {
                $isQuestValid = true;
                break;
            }
        }

        if (!$isQuestValid) {
            $errors[] = "Quest \"{$quest}\" tidak sesuai dengan Master Quest untuk Angkatan {$angkatan}";
        }

        return $errors;
    }

    private function extractAngkatan(string $nim): ?string
    {
        // NIM format: YYYYXXXXXXX (first 4 digits are angkatan)
        if (strlen($nim) >= 4 && ctype_digit($nim)) {
            return substr($nim, 0, 4);
        }
        return null;
    }

    private function getTargetForAngkatan(string $angkatan, array $masterQuests): ?int
    {
        foreach ($masterQuests as $quest) {
            if ($quest->angkatan === $angkatan && $quest->jenis_quest === 'profil_kating') {
                return $quest->target_jumlah;
            }
        }
        return null;
    }

    private function countPanitia(array $profiles): int
    {
        // Count profiles that are likely panitia (based on NIM pattern or chapter detection)
        // This is a simplified heuristic
        $count = 0;
        foreach ($profiles as $profile) {
            // Profiles without NIM or with specific patterns might be panitia
            // For now, count all as potential panitia
            $count++;
        }
        return $count;
    }

    private function fuzzyMatch(string $str1, string $str2, int $threshold = 80): bool
    {
        if ($str1 === $str2) {
            return true;
        }

        similar_text($str1, $str2, $percent);
        return $percent >= $threshold;
    }
}
