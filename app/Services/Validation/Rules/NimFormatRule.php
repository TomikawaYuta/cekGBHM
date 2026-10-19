<?php

namespace App\Services\Validation\Rules;

class NimFormatRule
{
    private int $expectedLength;

    public function __construct(int $expectedLength = 11)
    {
        $this->expectedLength = $expectedLength;
    }

    public function check(array $profile): array
    {
        $errors = [];

        if (!empty($profile['nim'])) {
            $nim = $profile['nim'];
            $actualLength = strlen($nim);

            if (!ctype_digit($nim)) {
                $errors[] = "NIM tidak valid, harus berupa angka";
            } elseif ($actualLength !== $this->expectedLength) {
                $errors[] = "NIM kurang lengkap hanya berjumlah {$actualLength} bukan {$this->expectedLength}";
            }
        }

        return $errors;
    }
}
