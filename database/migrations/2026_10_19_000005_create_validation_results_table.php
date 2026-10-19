<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('validation_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upload_session_id')->constrained()->onDelete('cascade');
            $table->enum('profil_type', ['cover', 'panitia', 'angkatan']);
            $table->string('profil_name');
            $table->integer('page_number');
            $table->json('profil_data');
            $table->enum('status', ['lolos', 'tidak_lolos']);
            $table->json('errors')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('validation_results');
    }
};
