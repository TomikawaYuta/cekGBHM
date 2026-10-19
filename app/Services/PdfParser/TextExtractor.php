<?php

namespace App\Services\PdfParser;

use Smalot\PdfParser\Parser;

class TextExtractor
{
    private Parser $parser;

    public function __construct()
    {
        $this->parser = new Parser();
    }

    /**
     * Extract text from PDF file
     */
    public function extract(string $pdfPath): array
    {
        $pdf = $this->parser->parseFile($pdfPath);
        $pages = $pdf->getPages();

        $pageTexts = [];
        foreach ($pages as $index => $page) {
            $pageTexts[] = [
                'page_number' => $index + 1,
                'text' => $page->getText(),
            ];
        }

        return $pageTexts;
    }

    /**
     * Detect if PDF is scanned (image-only, no extractable text)
     */
    public function isScannedPdf(array $pageTexts): bool
    {
        foreach ($pageTexts as $page) {
            $text = trim($page['text']);
            // If most pages have very little text, it's likely scanned
            if (strlen($text) > 50) {
                return false;
            }
        }
        return true;
    }
}
