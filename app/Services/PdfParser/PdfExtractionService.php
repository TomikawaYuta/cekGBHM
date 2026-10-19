<?php

namespace App\Services\PdfParser;

class PdfExtractionService
{
    private TextExtractor $textExtractor;
    private ImageExtractor $imageExtractor;
    private DataMapper $dataMapper;

    public function __construct()
    {
        $this->textExtractor = new TextExtractor();
        $this->imageExtractor = new ImageExtractor();
        $this->dataMapper = new DataMapper();
    }

    /**
     * Extract all data from PDF
     */
    public function extract(string $pdfPath): array
    {
        // Step 1: Extract text from PDF
        $pageTexts = $this->textExtractor->extract($pdfPath);

        // Step 2: Check if PDF is scanned (image-only)
        if ($this->textExtractor->isScannedPdf($pageTexts)) {
            return [
                'success' => false,
                'error' => 'Teks tidak dapat dibaca, pastikan PDF bukan hasil scan/gambar',
                'data' => null,
            ];
        }

        // Step 3: Extract image info
        $imageInfo = $this->imageExtractor->extract($pdfPath);

        // Step 4: Map text to structured data
        $mappedData = $this->dataMapper->map($pageTexts);

        // Step 5: Enrich with photo detection
        $mappedData = $this->enrichWithPhotoInfo($mappedData, $pdfPath);
        $mappedData['image_info'] = $imageInfo;

        return [
            'success' => true,
            'error' => null,
            'data' => $mappedData,
        ];
    }

    private function enrichWithPhotoInfo(array $data, string $pdfPath): array
    {
        // Add photo detection to panitia profiles
        foreach ($data['panitia'] as &$panitia) {
            $panitia['has_photo'] = $this->imageExtractor->hasPhotoOnPage(
                $pdfPath,
                $panitia['page_number']
            );
        }

        // Add photo detection to angkatan profiles
        foreach ($data['angkatan'] as &$angkatan) {
            $angkatan['has_photo'] = $this->imageExtractor->hasPhotoOnPage(
                $pdfPath,
                $angkatan['page_number']
            );
        }

        return $data;
    }
}
