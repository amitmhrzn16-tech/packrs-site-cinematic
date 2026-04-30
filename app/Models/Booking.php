<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'name', 'phone', 'address', 'business_registered',
        'business_type', 'avg_volume', 'notes', 'status',
        'source', 'ip_address', 'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'business_registered' => 'boolean',
        ];
    }
}
