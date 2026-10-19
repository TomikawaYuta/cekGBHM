@extends('layouts.app')

@section('title', 'Edit Rule')

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
            <h1 class="text-xl font-semibold text-gray-800">Edit Rule</h1>
        </div>

        <form method="POST" action="{{ route('admin.rules.update', $rule) }}" class="p-6 space-y-4">
            @csrf
            @method('PUT')

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                <select name="rule_type" required
                        class="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 @error('rule_type') border-red-500 @enderror">
                    <option value="first_impression" {{ old('rule_type', $rule->rule_type) == 'first_impression' ? 'selected' : '' }}>
                        First Impression
                    </option>
                    <option value="paling_berkesan" {{ old('rule_type', $rule->rule_type) == 'paling_berkesan' ? 'selected' : '' }}>
                        Paling Berkesan
                    </option>
                </select>
                @error('rule_type')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Minimum Kata</label>
                <input type="number" name="min_kata" value="{{ old('min_kata', $rule->min_kata) }}" required min="1"
                       class="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 @error('min_kata') border-red-500 @enderror">
                @error('min_kata')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea name="deskripsi" rows="3" required
                          class="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 @error('deskripsi') border-red-500 @enderror">{{ old('deskripsi', $rule->deskripsi) }}</textarea>
                @error('deskripsi')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex gap-4 pt-4">
                <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
                    Update
                </button>
                <a href="{{ route('admin.rules.index') }}"
                   class="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400">
                    Batal
                </a>
            </div>
        </form>
    </div>
</div>
@endsection
