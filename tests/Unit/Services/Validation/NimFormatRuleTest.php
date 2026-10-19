<?php

namespace Tests\Unit\Services\Validation;

use App\Services\Validation\Rules\NimFormatRule;
use PHPUnit\Framework\TestCase;

class NimFormatRuleTest extends TestCase
{
    private NimFormatRule $rule;

    protected function setUp(): void
    {
        parent::setUp();
        $this->rule = new NimFormatRule(11);
    }

    public function test_valid_nim_passes(): void
    {
        $profile = ['nim' => '20210010001'];

        $errors = $this->rule->check($profile);

        $this->assertEmpty($errors);
    }

    public function test_short_nim_fails(): void
    {
        $profile = ['nim' => '202100100'];

        $errors = $this->rule->check($profile);

        $this->assertCount(1, $errors);
        $this->assertStringContainsString('NIM kurang lengkap hanya berjumlah 9 bukan 11', $errors[0]);
    }

    public function test_non_numeric_nim_fails(): void
    {
        $profile = ['nim' => '2021001000A'];

        $errors = $this->rule->check($profile);

        $this->assertCount(1, $errors);
        $this->assertStringContainsString('NIM tidak valid, harus berupa angka', $errors[0]);
    }

    public function test_empty_nim_skips_validation(): void
    {
        $profile = ['nim' => ''];

        $errors = $this->rule->check($profile);

        $this->assertEmpty($errors);
    }
}
