<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_quest', function (Blueprint $table) {
            $table->id();
            $table->integer('chapter');
            $table->string('angkatan', 10);
            $table->string('jenis_quest');
            $table->text('deskripsi');
            $table->integer('target_jumlah');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_quest');
    }
};
