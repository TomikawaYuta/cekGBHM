@extends('layouts.app')

@section('title', 'Hasil Validasi')

@section('content')
<div class="max-w-6xl mx-auto">
    <div class="bg-white rounded-lg shadow mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-xl font-semibold text-gray-800">Hasil Validasi</h1>
                    <p class="text-sm text-gray-500 mt-1">{{ $uploadSession->filename }}</p>
                </div>
                <a href="{{ route('upload.index') }}"
                   class="text-indigo-600 hover:text-indigo-800">
                    &larr; Kembali
                </a>
            </div>
        </div>

        <div class="p-6">
            <!-- Summary -->
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-2xl font-bold text-gray-800">{{ $summary['total'] }}</p>
                    <p class="text-sm text-gray-500">Total Profil</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center">
                    <p class="text-2xl font-bold text-green-600">{{ $summary['lolos'] }}</p>
                    <p class="text-sm text-green-700">Lolos</p>
                </div>
                <div class="bg-red-50 rounded-lg p-4 text-center">
                    <p class="text-2xl font-bold text-red-600">{{ $summary['tidak_lolos'] }}</p>
                    <p class="text-sm text-red-700">Tidak Lolos</p>
                </div>
            </div>

            @if($uploadSession->extracted_data && !empty($uploadSession->extracted_data['warnings']))
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 class="font-medium text-yellow-800 mb-2">Peringatan:</h3>
                <ul class="list-disc list-inside text-sm text-yellow-700">
                    @foreach($uploadSession->extracted_data['warnings'] as $warning)
                    <li>{{ $warning }}</li>
                    @endforeach
                </ul>
            </div>
            @endif

            <!-- Results Table -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Halaman</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        @forelse($results as $result)
                        <tr class="{{ $result->status === 'tidak_lolos' ? 'bg-red-50' : '' }}">
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {{ $result->page_number ?: '-' }}
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {{ ucfirst($result->profil_type) }}
                            </td>
                            <td class="px-4 py-3 text-sm font-medium text-gray-900">
                                {{ $result->profil_name }}
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                                @if($result->status === 'lolos')
                                <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                    Lolos Pengecekan
                                </span>
                                @else
                                <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                    Tidak Lolos
                                </span>
                                @endif
                            </td>
                            <td class="px-4 py-3 text-sm">
                                @if($result->errors)
                                <ul class="list-disc list-inside text-red-600 space-y-1">
                                    @foreach($result->errors as $error)
                                    <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                                @else
                                <span class="text-green-600">Semua validasi passed</span>
                                @endif
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="5" class="px-4 py-4 text-center text-sm text-gray-500">
                                Tidak ada hasil validasi
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Extracted Data Details -->
    @if($uploadSession->extracted_data)
    <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">Data Hasil Ekstraksi</h2>
        </div>

        <div class="p-6 space-y-6">
            @if($uploadSession->extracted_data['cover'])
            <div>
                <h3 class="font-medium text-gray-800 mb-2">Cover</h3>
                <div class="bg-gray-50 rounded p-4 text-sm">
                    <p><span class="text-gray-500">Nama Pemilik:</span> {{ $uploadSession->extracted_data['cover']['nama_lengkap_pemilik'] ?? '-' }}</p>
                    <p><span class="text-gray-500">Nama Kelompok:</span> {{ $uploadSession->extracted_data['cover']['nama_kelompok'] ?? '-' }}</p>
                </div>
            </div>
            @endif

            @if(!empty($uploadSession->extracted_data['panitia']))
            <div>
                <h3 class="font-medium text-gray-800 mb-2">Panitia ({{ count($uploadSession->extracted_data['panitia']) }} profil)</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Hal</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Jabatan</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Challenge</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Foto</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @foreach($uploadSession->extracted_data['panitia'] as $panitia)
                            <tr>
                                <td class="px-3 py-2 text-gray-500">{{ $panitia['page_number'] }}</td>
                                <td class="px-3 py-2 font-medium">{{ $panitia['nama_lengkap'] ?? '-' }}</td>
                                <td class="px-3 py-2 text-gray-500">{{ $panitia['jabatan'] ?? '-' }}</td>
                                <td class="px-3 py-2 text-gray-500">{{ $panitia['challenge'] ?? '-' }}</td>
                                <td class="px-3 py-2">
                                    @if($panitia['has_photo'] ?? false)
                                    <span class="text-green-600">✓ Ada</span>
                                    @else
                                    <span class="text-red-600">✗ Tidak</span>
                                    @endif
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            @endif

            @if(!empty($uploadSession->extracted_data['angkatan']))
            <div>
                <h3 class="font-medium text-gray-800 mb-2">Angkatan ({{ count($uploadSession->extracted_data['angkatan']) }} profil)</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Hal</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">NIM</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">TTL</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Quest</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Foto</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @foreach($uploadSession->extracted_data['angkatan'] as $angkatan)
                            <tr>
                                <td class="px-3 py-2 text-gray-500">{{ $angkatan['page_number'] }}</td>
                                <td class="px-3 py-2 font-mono">{{ $angkatan['nim'] ?? '-' }}</td>
                                <td class="px-3 py-2 font-medium">{{ $angkatan['nama_lengkap'] ?? '-' }}</td>
                                <td class="px-3 py-2 text-gray-500">{{ $angkatan['tempat_tanggal_lahir'] ?? '-' }}</td>
                                <td class="px-3 py-2 text-gray-500">{{ $angkatan['quest'] ?? '-' }}</td>
                                <td class="px-3 py-2">
                                    @if($angkatan['has_photo'] ?? false)
                                    <span class="text-green-600">✓ Ada</span>
                                    @else
                                    <span class="text-red-600">✗ Tidak</span>
                                    @endif
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            @endif
        </div>
    </div>
    @endif
</div>
@endsection
