<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nama', 'nim', 'jabatan', 'challenge_1', 'challenge_2', 'challenge_3'])]
class Panitia extends Model
{
    use HasFactory;

    protected $table = 'master_panitia';

    public function challenges(): array
    {
        return [
            $this->challenge_1,
            $this->challenge_2,
            $this->challenge_3,
        ];
    }
}
