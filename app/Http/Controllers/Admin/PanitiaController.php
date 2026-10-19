<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Panitia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PanitiaController extends Controller
{
    public function index(Request $request): View
    {
        $query = Panitia::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%")
                    ->orWhere('jabatan', 'like', "%{$search}%");
            });
        }

        $panitias = $query->orderBy('nama')->paginate(10);

        return view('admin.panitia.index', compact('panitias'));
    }

    public function create(): View
    {
        return view('admin.panitia.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nim' => 'required|string|max:20|unique:master_panitia,nim',
            'jabatan' => 'required|string|max:255',
            'challenge_1' => 'required|string|max:255',
            'challenge_2' => 'required|string|max:255',
            'challenge_3' => 'required|string|max:255',
        ]);

        Panitia::create($validated);

        return redirect()
            ->route('admin.panitia.index')
            ->with('success', 'Data Panitia berhasil ditambahkan.');
    }

    public function edit(Panitia $panitia): View
    {
        return view('admin.panitia.edit', compact('panitia'));
    }

    public function update(Request $request, Panitia $panitia): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nim' => "required|string|max:20|unique:master_panitia,nim,{$panitia->id}",
            'jabatan' => 'required|string|max:255',
            'challenge_1' => 'required|string|max:255',
            'challenge_2' => 'required|string|max:255',
            'challenge_3' => 'required|string|max:255',
        ]);

        $panitia->update($validated);

        return redirect()
            ->route('admin.panitia.index')
            ->with('success', 'Data Panitia berhasil diperbarui.');
    }

    public function destroy(Panitia $panitia): RedirectResponse
    {
        $panitia->delete();

        return redirect()
            ->route('admin.panitia.index')
            ->with('success', 'Data Panitia berhasil dihapus.');
    }
}
