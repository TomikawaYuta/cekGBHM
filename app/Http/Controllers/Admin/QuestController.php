<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class QuestController extends Controller
{
    public function index(Request $request): View
    {
        $query = Quest::query();

        if ($chapter = $request->input('chapter')) {
            $query->where('chapter', $chapter);
        }

        if ($angkatan = $request->input('angkatan')) {
            $query->where('angkatan', $angkatan);
        }

        $quests = $query->orderBy('chapter')->orderBy('angkatan')->paginate(10);
        $chapters = Quest::select('chapter')->distinct()->orderBy('chapter')->pluck('chapter');
        $angkatans = Quest::select('angkatan')->distinct()->orderBy('angkatan')->pluck('angkatan');

        return view('admin.quest.index', compact('quests', 'chapters', 'angkatans'));
    }

    public function create(): View
    {
        return view('admin.quest.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'chapter' => 'required|integer|min:1|max:4',
            'angkatan' => 'required|string|max:10',
            'jenis_quest' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'target_jumlah' => 'required|integer|min:1',
        ]);

        Quest::create($validated);

        return redirect()
            ->route('admin.quest.index')
            ->with('success', 'Data Quest berhasil ditambahkan.');
    }

    public function edit(Quest $quest): View
    {
        return view('admin.quest.edit', compact('quest'));
    }

    public function update(Request $request, Quest $quest): RedirectResponse
    {
        $validated = $request->validate([
            'chapter' => 'required|integer|min:1|max:4',
            'angkatan' => 'required|string|max:10',
            'jenis_quest' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'target_jumlah' => 'required|integer|min:1',
        ]);

        $quest->update($validated);

        return redirect()
            ->route('admin.quest.index')
            ->with('success', 'Data Quest berhasil diperbarui.');
    }

    public function destroy(Quest $quest): RedirectResponse
    {
        $quest->delete();

        return redirect()
            ->route('admin.quest.index')
            ->with('success', 'Data Quest berhasil dihapus.');
    }
}
