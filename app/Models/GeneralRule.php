<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['rule_type', 'min_kata', 'deskripsi'])]
class GeneralRule extends Model
{
    use HasFactory;

    protected $table = 'master_general_rules';
}
