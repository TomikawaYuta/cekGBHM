<?php

namespace App\Services\PdfParser;

class DataMapper
{
    /**
     * Map extracted text to structured data based on page patterns
     */
    public function map(array $pageTexts): array
    {
        $result = [
            'cover' => null,
            'panitia' => [],
            'angkatan' => [],
            'warnings' => [],
        ];

        if (empty($pageTexts)) {
            $result['warnings'][] = 'Tidak ada teks yang dapat diekstrak dari PDF';
            return $result;
        }

        // Page 1 is Cover
        $result['cover'] = $this->mapCover($pageTexts[0]['text'] ?? '');

        // Process remaining pages
        for ($i = 1; $i < count($pageTexts); $i++) {
            $text = $pageTexts[$i]['text'];
            $pageNumber = $pageTexts[$i]['page_number'];

            // Determine if this is Panitia or Angkatan page
            if ($this->isPanitiaPage($text)) {
                $result['panitia'][] = $this->mapPanitiaProfile($text, $pageNumber);
            } elseif ($this->isAngkatanPage($text)) {
                $result['angkatan'][] = $this->mapAngkatanProfile($text, $pageNumber);
            } else {
                $result['warnings'][] = "Halaman {$pageNumber} tidak dikenali sebagai profil Panitia atau Angkatan";
            }
        }

        return $result;
    }

    private function mapCover(string $text): ?array
    {
        $lines = $this->extractLines($text);

        $namaLengkap = $this->findField($lines, ['nama lengkap pemilik', 'nama pemilik', 'nama']);
        $namaKelompok = $this->findField($lines, ['nama kelompok', 'kelompok']);

        if (!$namaLengkap && !$namaKelompok) {
            return null;
        }

        return [
            'nama_lengkap_pemilik' => $namaLengkap,
            'nama_kelompok' => $namaKelompok,
        ];
    }

    private function isPanitiaPage(string $text): bool
    {
        $lower = strtolower($text);
        return str_contains($lower, 'jabatan')
            || str_contains($lower, 'panitia')
            || str_contains($lower, 'challenge');
    }

    private function isAngkatanPage(string $text): bool
    {
        $lower = strtolower($text);
        return str_contains($lower, 'nim')
            || str_contains($lower, 'angkatan')
            || str_contains($lower, 'tempat')
            || str_contains($lower, 'tanggal lahir')
            || str_contains($lower, 'quest');
    }

    private function mapPanitiaProfile(string $text, int $pageNumber): array
    {
        $lines = $this->extractLines($text);

        return [
            'page_number' => $pageNumber,
            'nama_lengkap' => $this->findField($lines, ['nama lengkap', 'nama']),
            'jabatan' => $this->findField($lines, ['jabatan']),
            'challenge' => $this->findField($lines, ['challenge']),
            'first_impression' => $this->findField($lines, ['first impression', 'kesan pertama']),
            'paling_berkesan' => $this->findField($lines, ['paling berkesan', 'apa yang paling berkesan']),
            'has_photo' => false, // Will be set by ImageExtractor
        ];
    }

    private function mapAngkatanProfile(string $text, int $pageNumber): array
    {
        $lines = $this->extractLines($text);

        return [
            'page_number' => $pageNumber,
            'nim' => $this->findField($lines, ['nim', 'nomor induk mahasiswa']),
            'nama_lengkap' => $this->findField($lines, ['nama lengkap', 'nama']),
            'tempat_tanggal_lahir' => $this->findField($lines, ['tempat', 'tanggal lahir', 'ttl', 'tempat, tanggal lahir']),
            'quest' => $this->findField($lines, ['quest']),
            'jawaban_quest' => $this->findField($lines, ['jawaban', 'jawaban quest']),
            'first_impression' => $this->findField($lines, ['first impression', 'kesan pertama']),
            'paling_berkesan' => $this->findField($lines, ['paling berkesan', 'apa yang paling berkesan']),
            'has_photo' => false, // Will be set by ImageExtractor
        ];
    }

    private function extractLines(string $text): array
    {
        $lines = explode("\n", $text);
        return array_map('trim', array_filter($lines));
    }

    private function findField(array $lines, array $labels): ?string
    {
        foreach ($lines as $index => $line) {
            $lowerLine = strtolower($line);

            foreach ($labels as $label) {
                if (str_contains($lowerLine, strtolower($label))) {
                    // Try to extract value after "label:" or "label -"
                    $patterns = [
                        '/'.preg_quote($label, '/').'\s*[:\-–]\s*(.+)/i',
                        '/'.preg_quote($label, '/').'\s+(.+)/i',
                    ];

                    foreach ($patterns as $pattern) {
                        if (preg_match($pattern, $line, $matches)) {
                            return $this->cleanValue($matches[1]);
                        }
                    }

                    // If no value on same line, check next line
                    if (isset($lines[$index + 1])) {
                        $nextLine = $lines[$index + 1];
                        if (!empty($nextLine) && !$this->isLabel($nextLine)) {
                            return $this->cleanValue($nextLine);
                        }
                    }
                }
            }
        }

        return null;
    }

    private function isLabel(string $line): bool
    {
        $labels = ['nama', 'nim', 'jabatan', 'challenge', 'quest', 'first impression',
                   'paling berkesan', 'tempat', 'tanggal lahir', 'jawaban', 'foto'];

        $lower = strtolower(trim($line));
        foreach ($labels as $label) {
            if (str_contains($lower, $label) && strlen($lower) < 50) {
                return true;
            }
        }

        return false;
    }

    private function cleanValue(string $value): string
    {
        $value = trim($value);
        $value = preg_replace('/\s+/', ' ', $value);
        return $value;
    }
}
