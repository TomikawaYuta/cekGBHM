<?php

namespace Tests\Unit\Services\Validation;

use App\Services\Validation\Rules\CompletenessRule;
use PHPUnit\Framework\TestCase;

class CompletenessRuleTest extends TestCase
{
    private CompletenessRule $rule;

    protected function setUp(): void
    {
        parent::setUp();
        $this->rule = new CompletenessRule();
    }

    public function test_panitia_with_complete_data_passes(): void
    {
        $profile = [
            'nama_lengkap' => 'Ahmad Fauzi',
            'jabatan' => 'Ketua Umum',
            'challenge' => 'Membuat presentasi',
            'first_impression' => 'Orang yang sangat baik dan bertanggung jawab',
            'paling_berkesan' => 'Kerja sama tim yang sangat solid',
            'has_photo' => true,
        ];

        $errors = $this->rule->checkPanitia($profile);

        $this->assertEmpty($errors);
    }

    public function test_panitia_with_missing_fields_fails(): void
    {
        $profile = [
            'nama_lengkap' => 'Ahmad Fauzi',
            'jabatan' => null,
            'challenge' => 'Membuat presentasi',
            'first_impression' => 'Orang yang sangat baik',
            'paling_berkesan' => 'Kerja sama tim yang solid',
            'has_photo' => false,
        ];

        $errors = $this->rule->checkPanitia($profile);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Jabatan kosong', $errors[0]);
        $this->assertStringContainsString('Pas foto tidak ditemukan', $errors[1]);
    }

    public function test_angkatan_with_complete_data_passes(): void
    {
        $profile = [
            'nim' => '20210010001',
            'nama_lengkap' => 'Budi Santoso',
            'tempat_tanggal_lahir' => 'Surabaya, 12 Agustus 2005',
            'quest' => 'Temukan 15 teman',
            'jawaban_quest' => 'Saya bertemu dengan banyak teman baru',
            'first_impression' => 'Orang yang sangat ramah dan sopan',
            'paling_berkesan' => 'Kegiatan orientasi yang sangat seru',
            'has_photo' => true,
        ];

        $errors = $this->rule->checkAngkatan($profile);

        $this->assertEmpty($errors);
    }

    public function test_angkatan_with_empty_fields_fails(): void
    {
        $profile = [
            'nim' => '20210010001',
            'nama_lengkap' => 'Budi Santoso',
            'tempat_tanggal_lahir' => '',
            'quest' => 'Temukan 15 teman',
            'jawaban_quest' => null,
            'first_impression' => 'Orang yang ramah',
            'paling_berkesan' => 'Kegiatan orientasi',
            'has_photo' => true,
        ];

        $errors = $this->rule->checkAngkatan($profile);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Tempat, Tanggal Lahir kosong', $errors[0]);
        $this->assertStringContainsString('Jawaban Quest kosong', $errors[1]);
    }
}
