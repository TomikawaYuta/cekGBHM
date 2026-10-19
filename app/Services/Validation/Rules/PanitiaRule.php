<?php

namespace App\Services\Validation\Rules;

use App\Models\Panitia;

class PanitiaRule
{
    public function check(array $profile, array $masterPanitias): array
    {
        $errors = [];

        $nama = $profile['nama_lengkap'] ?? '';
        $jabatan = $profile['jabatan'] ?? '';
        $challenge = $profile['challenge'] ?? '';

        // Find matching panitia in master data
        $masterPanitia = $this->findMasterPanitia($nama, $jabatan, $masterPanitias);

        if (!$masterPanitia) {
            $errors[] = "Panitia \"{$nama}\" dengan jabatan \"{$jabatan}\" tidak ditemukan di database Panitia";
            return $errors;
        }

        // Validate challenge
        if (!empty($challenge)) {
            $validChallenges = [
                strtolower($masterPanitia->challenge_1),
                strtolower($masterPanitia->challenge_2),
                strtolower($masterPanitia->challenge_3),
            ];

            $isChallengeValid = false;
            foreach ($validChallenges as $validChallenge) {
                if ($this->fuzzyMatch(strtolower($challenge), $validChallenge, 90)) {
                    $isChallengeValid = true;
                    break;
                }
            }

            if (!$isChallengeValid) {
                $errors[] = "Challenge yang diinputkan tidak terdaftar untuk Panitia {$nama}";
            }
        }

        return $errors;
    }

    private function findMasterPanitia(string $nama, string $jabatan, array $masterPanitias): ?Panitia
    {
        foreach ($masterPanitias as $master) {
            $namaMatch = $this->fuzzyMatch(
                strtolower(trim($nama)),
                strtolower(trim($master->nama)),
                90
            );

            $jabatanMatch = $this->fuzzyMatch(
                strtolower(trim($jabatan)),
                strtolower(trim($master->jabatan)),
                90
            );

            if ($namaMatch && $jabatanMatch) {
                return $master;
            }
        }

        return null;
    }

    private function fuzzyMatch(string $str1, string $str2, int $threshold = 90): bool
    {
        if ($str1 === $str2) {
            return true;
        }

        similar_text($str1, $str2, $percent);
        return $percent >= $threshold;
    }
}
