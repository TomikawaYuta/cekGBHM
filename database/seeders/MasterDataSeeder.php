<?php

namespace Database\Seeders;

use App\Models\GeneralRule;
use App\Models\Panitia;
use App\Models\Quest;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // General Rules
        GeneralRule::create([
            'rule_type' => 'first_impression',
            'min_kata' => 3,
            'deskripsi' => 'First Impression harus minimal 3 kata',
        ]);

        GeneralRule::create([
            'rule_type' => 'paling_berkesan',
            'min_kata' => 3,
            'deskripsi' => 'Apa yang paling berkesan harus minimal 3 kata',
        ]);

        // Quest untuk Chapter 1 (Angkatan 2026) - target: All
        $chapter1Quests = [
            ['jenis_quest' => 'teman', 'deskripsi' => 'Temukan 15 teman baru', 'target_jumlah' => 15],
            ['jenis_quest' => 'dosen', 'deskripsi' => 'Temui 5 dosen', 'target_jumlah' => 5],
            ['jenis_quest' => 'tempat', 'deskripsi' => 'Kunjungi 3 tempat di kampus', 'target_jumlah' => 3],
        ];

        foreach ($chapter1Quests as $quest) {
            Quest::create(array_merge($quest, [
                'chapter' => 1,
                'angkatan' => '2026',
            ]));
        }

        // Quest untuk Chapter 2 (Angkatan 2025) - target: 15
        Quest::create([
            'chapter' => 2,
            'angkatan' => '2025',
            'jenis_quest' => 'profil_kating',
            'deskripsi' => 'Profil mahasiswa angkatan 2025',
            'target_jumlah' => 15,
        ]);

        // Quest untuk Chapter 3 (Angkatan 2024) - target: 5
        Quest::create([
            'chapter' => 3,
            'angkatan' => '2024',
            'jenis_quest' => 'profil_kating',
            'deskripsi' => 'Profil mahasiswa angkatan 2024',
            'target_jumlah' => 5,
        ]);

        // Quest untuk Chapter 4 (Angkatan 2023) - target: 5
        Quest::create([
            'chapter' => 4,
            'angkatan' => '2023',
            'jenis_quest' => 'profil_kating',
            'deskripsi' => 'Profil mahasiswa angkatan 2023',
            'target_jumlah' => 5,
        ]);

        // Contoh data Panitia (34 panitia - sample 5 dulu)
        $panitiaData = [
            ['nama' => 'Ahmad Fauzi', 'nim' => '20210010001', 'jabatan' => 'Ketua Umum', 'challenge_1' => 'Membuat presentasi', 'challenge_2' => 'Memimpin rapat', 'challenge_3' => 'Mengkoordinasi acara'],
            ['nama' => 'Siti Nurhaliza', 'nim' => '20210010002', 'jabatan' => 'Wakil Ketua', 'challenge_1' => 'Mengelola keuangan', 'challenge_2' => 'Membuat laporan', 'challenge_3' => 'Mengatur jadwal'],
            ['nama' => 'Budi Santoso', 'nim' => '20210010003', 'jabatan' => 'Sekretaris', 'challenge_1' => 'Membuat notulen', 'challenge_2' => 'Mengelola arsip', 'challenge_3' => 'Membuat surat'],
            ['nama' => 'Dewi Kartika', 'nim' => '20210010004', 'jabatan' => 'Bendahara', 'challenge_1' => 'Mencatat pemasukan', 'challenge_2' => 'Membuat anggaran', 'challenge_3' => 'Mengelola kas'],
            ['nama' => 'Rudi Hartono', 'nim' => '20210010005', 'jabatan' => 'Koord. Acara', 'challenge_1' => 'Merancang acara', 'challenge_2' => 'Mengundang narasumber', 'challenge_3' => 'Mengurus izin'],
        ];

        foreach ($panitiaData as $panitia) {
            Panitia::create($panitia);
        }
    }
}
