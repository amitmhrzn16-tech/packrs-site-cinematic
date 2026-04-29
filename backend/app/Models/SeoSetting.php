<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSetting extends Model
{
    protected $fillable = [
        'page_slug', 'meta_title', 'meta_description', 'canonical_url',
        'og_title', 'og_description', 'og_image', 'og_type', 'twitter_card',
        'keywords', 'robots_index', 'robots_follow', 'extra_meta',
    ];

    protected function casts(): array
    {
        return [
            'keywords' => 'array',
            'extra_meta' => 'array',
            'robots_index' => 'boolean',
            'robots_follow' => 'boolean',
        ];
    }
}
