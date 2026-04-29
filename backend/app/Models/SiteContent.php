<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = [
        'page_slug', 'content_key', 'type', 'value', 'label', 'sort_order',
    ];
}
