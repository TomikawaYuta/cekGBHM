<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_panitia', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('nim', 20)->unique();
            $table->string('jabatan');
            $table->string('challenge_1');
            $table->string('challenge_2');
            $table->string('challenge_3');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_panitia');
    }
};
