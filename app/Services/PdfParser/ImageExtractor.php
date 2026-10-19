<?php

namespace App\Services\PdfParser;

class ImageExtractor
{
    /**
     * Extract images from PDF using raw PDF parsing
     * Note: smalot/pdfparser doesn't directly extract images
     * We use a heuristic approach to detect image presence
     */
    public function extract(string $pdfPath): array
    {
        $images = [];

        // Read raw PDF content to detect images
        $content = file_get_contents($pdfPath);

        // Count image objects in PDF (XObject with /Subtype /Image)
        preg_match_all('/\/Subtype\s*\/Image/', $content, $matches);
        $imageCount = count($matches[0]);

        // Estimate images per page
        preg_match_all('/\/Count\s+(\d+)/', $content, $pageMatches);
        $pageCount = isset($pageMatches[1][0]) ? (int) $pageMatches[1][0] : 1;

        $estimatedPerPage = $pageCount > 0 ? ceil($imageCount / $pageCount) : 0;

        return [
            'total_images' => $imageCount,
            'page_count' => $pageCount,
            'estimated_per_page' => $estimatedPerPage,
            'has_images' => $imageCount > 0,
        ];
    }

    /**
     * Detect if a profile page likely has a photo
     * Based on image count heuristics
     */
    public function hasPhotoOnPage(string $pdfPath, int $pageNumber): bool
    {
        $content = file_get_contents($pdfPath);

        // Split by page objects
        $pages = explode('/Type /Page', $content);

        if (isset($pages[$pageNumber])) {
            $pageContent = $pages[$pageNumber];
            preg_match_all('/\/Subtype\s*\/Image/', $pageContent, $matches);
            return count($matches[0]) > 0;
        }

        return false;
    }
}
