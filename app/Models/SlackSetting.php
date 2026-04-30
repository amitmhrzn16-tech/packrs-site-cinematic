<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SlackSetting extends Model
{
    protected $fillable = [
        'webhook_url', 'channel', 'username', 'icon_emoji',
        'notify_bookings', 'notify_tracking_lookup',
        'enabled', 'last_sent_at', 'total_sent',
    ];

    protected function casts(): array
    {
        return [
            'notify_bookings' => 'boolean',
            'notify_tracking_lookup' => 'boolean',
            'enabled' => 'boolean',
            'last_sent_at' => 'datetime',
        ];
    }

    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1], []);
    }
}
