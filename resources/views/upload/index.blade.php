@extends('layouts.app')

@section('title', 'Upload PDF GBHM')

@section('content')
<div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
            <h1 class="text-xl font-semibold text-gray-800">Upload File GBHM</h1>
            <p class="text-sm text-gray-500 mt-1">Upload file PDF GBHM untuk validasi otomatis</p>
        </div>

        <form method="POST" action="{{ route('upload.store') }}" enctype="multipart/form-data"
              class="p-6" id="uploadForm">
            @csrf

            <div class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors"
                 id="dropZone">
                <input type="file" name="pdf_file" id="pdf_file" accept=".pdf" class="hidden" required>
                <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p class="mt-4 text-lg text-gray-600">Drag & drop file PDF di sini</p>
                <p class="mt-2 text-sm text-gray-500">atau</p>
                <button type="button" id="browseBtn"
                        class="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
                    Pilih File
                </button>
                <p class="mt-4 text-xs text-gray-400">Maksimal 10MB, format .pdf</p>
            </div>

            <div id="filePreview" class="hidden mt-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <svg class="h-8 w-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clip-rule="evenodd"/>
                        </svg>
                        <div>
                            <p class="font-medium text-gray-800" id="fileName"></p>
                            <p class="text-sm text-gray-500" id="fileSize"></p>
                        </div>
                    </div>
                    <button type="button" id="removeFile" class="text-red-600 hover:text-red-800">
                        &times; Hapus
                    </button>
                </div>
            </div>

            @error('pdf_file')
            <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
            @enderror

            <div class="mt-6 flex justify-end">
                <button type="submit" id="submitBtn"
                        class="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled>
                    Upload & Validasi
                </button>
            </div>
        </form>
    </div>

    <!-- Upload History -->
    <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">Riwayat Upload</h2>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    @forelse($uploadSessions as $session)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ $session->filename }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            @php
                                $statusClasses = [
                                    'pending' => 'bg-yellow-100 text-yellow-800',
                                    'processing' => 'bg-blue-100 text-blue-800',
                                    'completed' => 'bg-green-100 text-green-800',
                                    'failed' => 'bg-red-100 text-red-800',
                                ];
                            @endphp
                            <span class="px-2 py-1 text-xs rounded-full {{ $statusClasses[$session->status] ?? 'bg-gray-100' }}">
                                {{ ucfirst($session->status) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $session->created_at->format('d M Y H:i') }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            @if($session->status === 'completed')
                            <a href="{{ route('upload.show', $session) }}"
                               class="text-indigo-600 hover:text-indigo-900">Lihat Hasil</a>
                            @elseif($session->status === 'failed')
                            <span class="text-red-600 text-sm">{{ $session->error_message }}</span>
                            @else
                            <span class="text-gray-400">Memproses...</span>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                            Belum ada upload
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="px-6 py-4">
            {{ $uploadSessions->links() }}
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('pdf_file');
    const browseBtn = document.getElementById('browseBtn');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    const submitBtn = document.getElementById('submitBtn');

    browseBtn.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-indigo-500', 'bg-indigo-50');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-indigo-500', 'bg-indigo-50');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-indigo-500', 'bg-indigo-50');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            fileInput.files = files;
            showPreview(files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            showPreview(fileInput.files[0]);
        }
    });

    removeFile.addEventListener('click', () => {
        fileInput.value = '';
        filePreview.classList.add('hidden');
        submitBtn.disabled = true;
    });

    function showPreview(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatSize(file.size);
        filePreview.classList.remove('hidden');
        submitBtn.disabled = false;
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
});
</script>
@endsection
