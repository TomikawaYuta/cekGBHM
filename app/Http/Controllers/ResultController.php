<?php

namespace App\Http\Controllers;

use App\Models\UploadSession;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ResultController extends Controller
{
    public function index(Request $request): View
    {
        $query = UploadSession::with('user')->where('status', 'completed');

        if ($search = $request->input('search')) {
            $query->where('filename', 'like', "%{$search}%");
        }

        $uploadSessions = $query->latest()->paginate(10);

        return view('results.index', compact('uploadSessions'));
    }
}
