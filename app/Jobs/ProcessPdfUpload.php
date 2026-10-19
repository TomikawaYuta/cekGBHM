<?php

namespace App\Jobs;

use App\Models\UploadSession;
use App\Services\PdfParser\PdfExtractionService;
use App\Services\Validation\ValidationEngine;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPdfUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;

    public function __construct(
        public UploadSession $uploadSession
    ) {}

    public function handle(): void
    {
        try {
            $this->uploadSession->update(['status' => 'processing']);

            // Step 1: Extract data from PDF
            $extractionService = new PdfExtractionService();
            $extractionResult = $extractionService->extract($this->uploadSession->filepath);

            if (!$extractionResult['success']) {
                $this->uploadSession->update([
                    'status' => 'failed',
                    'error_message' => $extractionResult['error'],
                ]);
                return;
            }

            // Save extracted data
            $extractedData = $extractionResult['data'];
            $this->uploadSession->update([
                'extracted_data' => $extractedData,
            ]);

            // Step 2: Validate extracted data
            $validationEngine = new ValidationEngine();
            $results = $validationEngine->validate($this->uploadSession, $extractedData);

            // Update results with upload_session_id
            foreach ($results as $result) {
                $result['upload_session_id'] = $this->uploadSession->id;
                \App\Models\ValidationResult::create($result);
            }

            $this->uploadSession->update([
                'status' => 'completed',
                'uploaded_at' => now(),
            ]);

        } catch (\Exception $e) {
            $this->uploadSession->update([
                'status' => 'failed',
                'error_message' => 'Terjadi kesalahan saat memproses PDF: ' . $e->getMessage(),
            ]);

            \Log::error('PDF Processing Failed', [
                'upload_session_id' => $this->uploadSession->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
