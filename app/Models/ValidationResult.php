<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'upload_session_id',
    'profil_type',
    'profil_name',
    'page_number',
    'profil_data',
    'status',
    'errors',
    'details',
])]
class ValidationResult extends Model
{
    use HasFactory;

    protected $casts = [
        'profil_data' => 'array',
        'errors' => 'array',
        'details' => 'array',
    ];

    public function uploadSession(): BelongsTo
    {
        return $this->belongsTo(UploadSession::class);
    }

    public function isLolos(): bool
    {
        return $this->status === 'lolos';
    }
}
