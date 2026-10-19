<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Panitia;
use App\Models\Quest;
use App\Models\UploadSession;
use App\Models\ValidationResult;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $stats = [
            'total_panitia' => Panitia::count(),
            'total_quest' => Quest::count(),
            'total_uploads' => UploadSession::count(),
            'total_valid' => ValidationResult::where('status', 'lolos')->count(),
            'total_invalid' => ValidationResult::where('status', 'tidak_lolos')->count(),
        ];

        $recentUploads = UploadSession::with('user')
            ->latest()
            ->take(5)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentUploads'));
    }
}
