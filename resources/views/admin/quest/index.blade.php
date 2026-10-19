@extends('layouts.app')

@section('title', 'Data Quest')

@section('content')
<div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h1 class="text-xl font-semibold text-gray-800">Data Quest</h1>
        <a href="{{ route('admin.quest.create') }}"
           class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            + Tambah Quest
        </a>
    </div>

    <div class="p-6">
        <form method="GET" action="{{ route('admin.quest.index') }}" class="mb-4">
            <div class="flex gap-2">
                <select name="chapter" class="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Semua Chapter</option>
                    @for($i = 1; $i <= 4; $i++)
                    <option value="{{ $i }}" {{ request('chapter') == $i ? 'selected' : '' }}>
                        Chapter {{ $i }}
                    </option>
                    @endfor
                </select>
                <select name="angkatan" class="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Semua Angkatan</option>
                    @foreach($angkatans as $angkatan)
                    <option value="{{ $angkatan }}" {{ request('angkatan') == $angkatan ? 'selected' : '' }}>
                        {{ $angkatan }}
                    </option>
                    @endforeach
                </select>
                <button type="submit" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                    Filter
                </button>
            </div>
        </form>

        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Angkatan</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Quest</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @forelse($quests as $quest)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ $quest->chapter }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $quest->angkatan }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $quest->jenis_quest }}
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-500">
                            {{ $quest->deskripsi }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $quest->target_jumlah }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <a href="{{ route('admin.quest.edit', $quest) }}"
                               class="text-indigo-600 hover:text-indigo-900">Edit</a>
                            <form method="POST" action="{{ route('admin.quest.destroy', $quest) }}"
                                  class="inline" onsubmit="return confirm('Yakin hapus?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-900">Hapus</button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                            Tidak ada data quest
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-4">
            {{ $quests->links() }}
        </div>
    </div>
</div>
@endsection
