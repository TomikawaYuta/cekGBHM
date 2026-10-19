<?php

namespace App\Services\Validation;

use App\Models\GeneralRule;
use App\Models\Panitia;
use App\Models\Quest;
use App\Models\UploadSession;
use App\Models\ValidationResult;
use App\Services\Validation\Rules\CompletenessRule;
use App\Services\Validation\Rules\DuplicateRule;
use App\Services\Validation\Rules\NimFormatRule;
use App\Services\Validation\Rules\PanitiaRule;
use App\Services\Validation\Rules\QuestRule;
use App\Services\Validation\Rules\TextLengthRule;

class ValidationEngine
{
    private CompletenessRule $completenessRule;
    private TextLengthRule $textLengthRule;
    private NimFormatRule $nimFormatRule;
    private DuplicateRule $duplicateRule;
    private PanitiaRule $panitiaRule;
    private QuestRule $questRule;

    public function __construct()
    {
        $this->completenessRule = new CompletenessRule();
        $this->duplicateRule = new DuplicateRule();
        $this->panitiaRule = new PanitiaRule();
        $this->questRule = new QuestRule();

        // Load min kata from GeneralRule
        $generalRule = GeneralRule::where('rule_type', 'first_impression')->first();
        $minKata = $generalRule->min_kata ?? 3;

        $this->textLengthRule = new TextLengthRule($minKata);
        $this->nimFormatRule = new NimFormatRule(11);
    }

    /**
     * Validate extracted data and save results
     */
    public function validate(UploadSession $uploadSession, array $extractedData): array
    {
        $allResults = [];
        $masterPanitias = Panitia::all();
        $masterQuests = Quest::all();

        // Validate Cover
        if (!empty($extractedData['cover'])) {
            $coverResult = $this->validateCover($extractedData['cover']);
            $allResults[] = $coverResult;
        }

        // Validate Panitia Profiles
        if (!empty($extractedData['panitia'])) {
            $panitiaResults = $this->validatePanitiaProfiles($extractedData['panitia'], $masterPanitias);
            $allResults = array_merge($allResults, $panitiaResults);
        }

        // Validate Angkatan Profiles
        if (!empty($extractedData['angkatan'])) {
            $angkatanResults = $this->validateAngkatanProfiles($extractedData['angkatan'], $masterQuests);
            $allResults = array_merge($allResults, $angkatanResults);
        }

        // Check duplicate NIMs across all angkatan profiles
        if (!empty($extractedData['angkatan'])) {
            $duplicateNimErrors = $this->duplicateRule->checkNimDuplicates($extractedData['angkatan']);
            $duplicateIdenticalErrors = $this->duplicateRule->checkIdenticalProfiles($extractedData['angkatan']);

            if (!empty($duplicateNimErrors) || !empty($duplicateIdenticalErrors)) {
                // Add errors to the global result
                $globalErrors = array_merge($duplicateNimErrors, $duplicateIdenticalErrors);
                $allResults[] = $this->createResult(
                    $uploadSession,
                    'angkatan',
                    'Validasi Duplikasi Global',
                    0,
                    [],
                    'tidak_lolos',
                    $globalErrors
                );
            }
        }

        // Check angkatan count vs target
        if (!empty($extractedData['angkatan'])) {
            $countErrors = $this->questRule->checkAngkatanCount($extractedData['angkatan'], $masterQuests);
            if (!empty($countErrors)) {
                $allResults[] = $this->createResult(
                    $uploadSession,
                    'angkatan',
                    'Validasi Jumlah Profil',
                    0,
                    [],
                    'tidak_lolos',
                    $countErrors
                );
            }
        }

        // Save all results to database
        foreach ($allResults as $result) {
            ValidationResult::create($result);
        }

        return $allResults;
    }

    private function validateCover(array $cover): array
    {
        $errors = [];

        if (empty($cover['nama_lengkap_pemilik'])) {
            $errors[] = "Data Nama Lengkap Pemilik kosong";
        }

        if (empty($cover['nama_kelompok'])) {
            $errors[] = "Data Nama Kelompok kosong";
        }

        return [
            'profil_type' => 'cover',
            'profil_name' => $cover['nama_lengkap_pemilik'] ?? 'Cover',
            'page_number' => 1,
            'profil_data' => $cover,
            'status' => empty($errors) ? 'lolos' : 'tidak_lolos',
            'errors' => empty($errors) ? null : $errors,
            'details' => null,
        ];
    }

    private function validatePanitiaProfiles(array $profiles, array $masterPanitias): array
    {
        $results = [];

        foreach ($profiles as $profile) {
            $errors = [];

            // Rule 1: Completeness
            $errors = array_merge($errors, $this->completenessRule->checkPanitia($profile));

            // Rule 2: Text length
            $errors = array_merge($errors, $this->textLengthRule->check($profile));

            // Rule 3: Panitia validation (name, jabatan, challenge)
            $errors = array_merge($errors, $this->panitiaRule->check($profile, $masterPanitias));

            $results[] = $this->createResult(
                null,
                'panitia',
                $profile['nama_lengkap'] ?? 'Tanpa Nama',
                $profile['page_number'] ?? 0,
                $profile,
                empty($errors) ? 'lolos' : 'tidak_lolos',
                empty($errors) ? null : $errors
            );
        }

        return $results;
    }

    private function validateAngkatanProfiles(array $profiles, array $masterQuests): array
    {
        $results = [];

        foreach ($profiles as $profile) {
            $errors = [];

            // Rule 1: Completeness
            $errors = array_merge($errors, $this->completenessRule->checkAngkatan($profile));

            // Rule 2: Text length
            $errors = array_merge($errors, $this->textLengthRule->check($profile));

            // Rule 3: NIM format
            $errors = array_merge($errors, $this->nimFormatRule->check($profile));

            // Rule 4: Quest validation
            $errors = array_merge($errors, $this->questRule->checkQuestMatch($profile, $masterQuests));

            $results[] = $this->createResult(
                null,
                'angkatan',
                $profile['nama_lengkap'] ?? 'Tanpa Nama',
                $profile['page_number'] ?? 0,
                $profile,
                empty($errors) ? 'lolos' : 'tidak_lolos',
                empty($errors) ? null : $errors
            );
        }

        return $results;
    }

    private function createResult(
        ?UploadSession $uploadSession,
        string $profilType,
        string $profilName,
        int $pageNumber,
        array $profilData,
        string $status,
        ?array $errors
    ): array {
        return [
            'upload_session_id' => $uploadSession?->id,
            'profil_type' => $profilType,
            'profil_name' => $profilName,
            'page_number' => $pageNumber,
            'profil_data' => $profilData,
            'status' => $status,
            'errors' => $errors,
            'details' => null,
        ];
    }
}
