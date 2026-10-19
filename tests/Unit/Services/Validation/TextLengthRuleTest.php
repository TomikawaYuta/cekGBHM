<?php

namespace Tests\Unit\Services\Validation;

use App\Services\Validation\Rules\TextLengthRule;
use PHPUnit\Framework\TestCase;

class TextLengthRuleTest extends TestCase
{
    private TextLengthRule $rule;

    protected function setUp(): void
    {
        parent::setUp();
        $this->rule = new TextLengthRule(3);
    }

    public function test_text_with_enough_words_passes(): void
    {
        $profile = [
            'first_impression' => 'Orang yang sangat baik dan bertanggung jawab',
            'paling_berkesan' => 'Kerja sama tim yang sangat solid dan menyenangkan',
        ];

        $errors = $this->rule->check($profile);

        $this->assertEmpty($errors);
    }

    public function test_text_with_fewer_words_fails(): void
    {
        $profile = [
            'first_impression' => 'Baik banget',
            'paling_berkesan' => 'Sangat berkesan',
        ];

        $errors = $this->rule->check($profile);

        $this->assertCount(2, $errors);
        $this->assertStringContainsString('First Impression hanya 2 kata, minimal 3 kata', $errors[0]);
        $this->assertStringContainsString('Apa yang paling berkesan hanya 2 kata, minimal 3 kata', $errors[1]);
    }

    public function test_text_with_punctuation_is_counted_correctly(): void
    {
        $profile = [
            'first_impression' => 'Baik, tegas, disiplin.',
            'paling_berkesan' => 'Menyenangkan, seru, asyik!',
        ];

        $errors = $this->rule->check($profile);

        $this->assertEmpty($errors);
    }

    public function test_empty_text_skips_validation(): void
    {
        $profile = [
            'first_impression' => '',
            'paling_berkesan' => null,
        ];

        $errors = $this->rule->check($profile);

        $this->assertEmpty($errors);
    }
}
