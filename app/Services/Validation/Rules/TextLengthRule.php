<?php

namespace App\Services\Validation\Rules;

class TextLengthRule
{
    private int $minWords;

    public function __construct(int $minWords = 3)
    {
        $this->minWords = $minWords;
    }

    public function check(array $profile): array
    {
        $errors = [];

        // Check First Impression
        if (!empty($profile['first_impression'])) {
            $wordCount = $this->countWords($profile['first_impression']);
            if ($wordCount < $this->minWords) {
                $errors[] = "First Impression hanya {$wordCount} kata, minimal {$this->minWords} kata";
            }
        }

        // Check Paling Berkesan
        if (!empty($profile['paling_berkesan'])) {
            $wordCount = $this->countWords($profile['paling_berkesan']);
            if ($wordCount < $this->minWords) {
                $errors[] = "Apa yang paling berkesan hanya {$wordCount} kata, minimal {$this->minWords} kata";
            }
        }

        return $errors;
    }

    private function countWords(string $text): int
    {
        // Remove punctuation and extra spaces, then count words
        $text = preg_replace('/[^\w\s]/u', '', $text);
        $text = trim($text);

        if (empty($text)) {
            return 0;
        }

        return count(preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY));
    }
}
