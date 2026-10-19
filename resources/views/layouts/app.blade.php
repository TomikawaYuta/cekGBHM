<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') - Sistem Pengecekan GBHM</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
                <div class="flex items-center space-x-8">
                    <a href="{{ route('admin.dashboard') }}" class="text-xl font-bold text-indigo-600">
                        GBHM Checker
                    </a>
                    <div class="hidden md:flex space-x-4">
                        <a href="{{ route('admin.dashboard') }}"
                           class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md {{ request()->routeIs('admin.dashboard') ? 'bg-indigo-50 text-indigo-600' : '' }}">
                            Dashboard
                        </a>
                        <a href="{{ route('upload.index') }}"
                           class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md {{ request()->routeIs('upload.*') ? 'bg-indigo-50 text-indigo-600' : '' }}">
                            Upload
                        </a>
                        <a href="{{ route('results.index') }}"
                           class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md {{ request()->routeIs('results.*') ? 'bg-indigo-50 text-indigo-600' : '' }}">
                            Hasil
                        </a>
                        <a href="{{ route('admin.panitia.index') }}"
                           class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md {{ request()->routeIs('admin.panitia.*') ? 'bg-indigo-50 text-indigo-600' : '' }}">
                            Panitia
                        </a>
                        <a href="{{ route('admin.quest.index') }}"
                           class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md {{ request()->routeIs('admin.quest.*') ? 'bg-indigo-50 text-indigo-600' : '' }}">
                            Quest
                        </a>
                        <a href="{{ route('admin.rules.index') }}"
                           class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md {{ request()->routeIs('admin.rules.*') ? 'bg-indigo-50 text-indigo-600' : '' }}">
                            Rules
                        </a>
                    </div>
                </div>
                <div class="flex items-center">
                    <span class="text-gray-600 mr-4">{{ auth()->user()->name ?? 'Admin' }}</span>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="text-red-600 hover:text-red-800">
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4">
        @if(session('success'))
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ session('error') }}
            </div>
        @endif

        @yield('content')
    </main>
</body>
</html>
