<?php

namespace Tests\Unit\Services\Validation;

use App\Services\Validation\Rules\DuplicateRule;
use PHPUnit\Framework\TestCase;

class DuplicateRuleTest extends TestCase
{
    private DuplicateRule $rule;

    protected function setUp(): void
    {
        parent::setUp();
        $this->rule = new DuplicateRule();
    }

    public function test_no_duplicate_nims_passes(): void
    {
        $profiles = [
            ['nim' => '20210010001', 'page_number' => 2],
            ['nim' => '20210010002', 'page_number' => 3],
            ['nim' => '20210010003', 'page_number' => 4],
        ];

        $errors = $this->rule->checkNimDuplicates($profiles);

        $this->assertEmpty($errors);
    }

    public function test_duplicate_nims_fails(): void
    {
        $profiles = [
            ['nim' => '20210010001', 'page_number' => 2],
            ['nim' => '20210010002', 'page_number' => 3],
            ['nim' => '20210010001', 'page_number' => 4],
        ];

        $errors = $this->rule->checkNimDuplicates($profiles);

        $this->assertCount(1, $errors);
        $this->assertStringContainsString('NIM 20210010001 terindikasi duplikat pada halaman 4', $errors[0]);
    }

    public function test_identical_profiles_fails(): void
    {
        $profiles = [
            [
                'nama_lengkap' => 'Budi Santoso',
                'nim' => '20210010001',
                'first_impression' => 'Orang baik',
                'paling_berkesan' => 'Kegiatan seru',
                'page_number' => 2,
            ],
            [
                'nama_lengkap' => 'Budi Santoso',
                'nim' => '20210010001',
                'first_impression' => 'Orang baik',
                'paling_berkesan' => 'Kegiatan seru',
                'page_number' => 3,
            ],
        ];

        $errors = $this->rule->checkIdenticalProfiles($profiles);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('identik dengan halaman 2', $errors[0]);
    }

    public function test_different_profiles_passes(): void
    {
        $profiles = [
            [
                'nama_lengkap' => 'Budi Santoso',
                'nim' => '20210010001',
                'first_impression' => 'Orang baik dan ramah',
                'paling_berkesan' => 'Kegiatan orientasi yang seru',
                'page_number' => 2,
            ],
            [
                'nama_lengkap' => 'Andi Wijaya',
                'nim' => '20210010002',
                'first_impression' => 'Orang pintar dan rajin',
                'paling_berkesan' => 'Belajar kelompok yang menyenangkan',
                'page_number' => 3,
            ],
        ];

        $errors = $this->rule->checkIdenticalProfiles($profiles);

        $this->assertEmpty($errors);
    }
}
