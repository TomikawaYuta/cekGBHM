<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPdfUpload;
use App\Models\UploadSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class UploadController extends Controller
{
    public function index(): View
    {
        $uploadSessions = UploadSession::where('user_id', auth()->id())
            ->latest()
            ->paginate(10);

        return view('upload.index', compact('uploadSessions'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'pdf_file' => 'required|file|mimes:pdf|max:10240', // Max 10MB
        ]);

        $file = $request->file('pdf_file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $filepath = $file->storeAs('uploads/' . auth()->id(), $filename, 'local');

        $uploadSession = UploadSession::create([
            'user_id' => auth()->id(),
            'filename' => $file->getClientOriginalName(),
            'filepath' => Storage::disk('local')->path($filepath),
            'status' => 'pending',
        ]);

        // Dispatch job to process PDF
        ProcessPdfUpload::dispatch($uploadSession);

        return redirect()
            ->route('upload.index')
            ->with('success', 'File berhasil diunggah. Sedang diproses...');
    }

    public function show(UploadSession $uploadSession): View
    {
        // Ensure user owns this upload
        if ($uploadSession->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            abort(403);
        }

        $results = $uploadSession->validationResults()->get();

        // Calculate summary
        $summary = [
            'total' => $results->count(),
            'lolos' => $results->where('status', 'lolos')->count(),
            'tidak_lolos' => $results->where('status', 'tidak_lolos')->count(),
        ];

        return view('results.show', compact('uploadSession', 'results', 'summary'));
    }
}
