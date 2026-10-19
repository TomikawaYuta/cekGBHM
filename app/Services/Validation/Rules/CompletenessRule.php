<?php

namespace App\Services\Validation\Rules;

class CompletenessRule
{
    private const PANITIA_FIELDS = ['nama_lengkap', 'jabatan', 'challenge', 'first_impression', 'paling_berkesan'];
    private const ANGKATAN_FIELDS = ['nim', 'nama_lengkap', 'tempat_tanggal_lahir', 'quest', 'jawaban_quest', 'first_impression', 'paling_berkesan'];

    public function checkPanitia(array $profile): array
    {
        $errors = [];

        foreach (self::PANITIA_FIELDS as $field) {
            if (empty($profile[$field])) {
                $fieldName = $this->getIndonesianFieldName($field);
                $errors[] = "Data {$fieldName} kosong";
            }
        }

        if (empty($profile['has_photo'])) {
            $errors[] = "Pas foto tidak ditemukan";
        }

        return $errors;
    }

    public function checkAngkatan(array $profile): array
    {
        $errors = [];

        foreach (self::ANGKATAN_FIELDS as $field) {
            if (empty($profile[$field])) {
                $fieldName = $this->getIndonesianFieldName($field);
                $errors[] = "Data {$fieldName} kosong";
            }
        }

        if (empty($profile['has_photo'])) {
            $errors[] = "Pas foto tidak ditemukan";
        }

        return $errors;
    }

    private function getIndonesianFieldName(string $field): string
    {
        return match ($field) {
            'nama_lengkap' => 'Nama Lengkap',
            'jabatan' => 'Jabatan',
            'challenge' => 'Challenge',
            'first_impression' => 'First Impression',
            'paling_berkesan' => 'Apa yang paling berkesan',
            'nim' => 'NIM',
            'tempat_tanggal_lahir' => 'Tempat, Tanggal Lahir',
            'quest' => 'Quest',
            'jawaban_quest' => 'Jawaban Quest',
            default => $field,
        };
    }
}
