<?php

namespace App\Services\Validation\Rules;

class DuplicateRule
{
    public function checkNimDuplicates(array $profiles): array
    {
        $errors = [];
        $nimMap = [];

        foreach ($profiles as $profile) {
            $nim = $profile['nim'] ?? null;
            $pageNumber = $profile['page_number'] ?? '?';

            if (!empty($nim)) {
                if (isset($nimMap[$nim])) {
                    $errors[] = "NIM {$nim} terindikasi duplikat pada halaman {$pageNumber} (sama dengan halaman {$nimMap[$nim]})";
                } else {
                    $nimMap[$nim] = $pageNumber;
                }
            }
        }

        return $errors;
    }

    public function checkIdenticalProfiles(array $profiles): array
    {
        $errors = [];
        $signatureMap = [];

        foreach ($profiles as $profile) {
            $pageNumber = $profile['page_number'] ?? '?';

            // Create signature from key fields
            $fieldsToCompare = [
                $profile['nama_lengkap'] ?? '',
                $profile['nim'] ?? '',
                $profile['first_impression'] ?? '',
                $profile['paling_berkesan'] ?? '',
            ];

            $signature = md5(implode('|', array_map([$this, 'normalize'], $fieldsToCompare)));

            if (isset($signatureMap[$signature])) {
                $errors[] = "Data profil pada halaman {$pageNumber} identik dengan halaman {$signatureMap[$signature]} (indikasi copy-paste)";
            } else {
                $signatureMap[$signature] = $pageNumber;
            }
        }

        return $errors;
    }

    private function normalize(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/\s+/', ' ', $value);
        return $value;
    }
}
