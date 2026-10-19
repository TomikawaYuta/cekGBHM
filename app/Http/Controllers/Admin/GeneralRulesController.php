<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GeneralRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class GeneralRulesController extends Controller
{
    public function index(): View
    {
        $rules = GeneralRule::orderBy('rule_type')->paginate(10);

        return view('admin.rules.index', compact('rules'));
    }

    public function create(): View
    {
        return view('admin.rules.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rule_type' => 'required|string|max:255|unique:master_general_rules,rule_type',
            'min_kata' => 'required|integer|min:1',
            'deskripsi' => 'required|string',
        ]);

        GeneralRule::create($validated);

        return redirect()
            ->route('admin.rules.index')
            ->with('success', 'Rule berhasil ditambahkan.');
    }

    public function edit(GeneralRule $rule): View
    {
        return view('admin.rules.edit', compact('rule'));
    }

    public function update(Request $request, GeneralRule $rule): RedirectResponse
    {
        $validated = $request->validate([
            'rule_type' => "required|string|max:255|unique:master_general_rules,rule_type,{$rule->id}",
            'min_kata' => 'required|integer|min:1',
            'deskripsi' => 'required|string',
        ]);

        $rule->update($validated);

        return redirect()
            ->route('admin.rules.index')
            ->with('success', 'Rule berhasil diperbarui.');
    }

    public function destroy(GeneralRule $rule): RedirectResponse
    {
        $rule->delete();

        return redirect()
            ->route('admin.rules.index')
            ->with('success', 'Rule berhasil dihapus.');
    }
}
