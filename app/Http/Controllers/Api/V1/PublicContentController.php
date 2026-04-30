<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SeoSetting;
use App\Models\SiteContent;
use Illuminate\Http\JsonResponse;

/**
 * Public read-only endpoints for the React frontend. Returns a flat map
 * of { content_key: value } for fast hydration on the page.
 */
class PublicContentController extends Controller
{
    public function content(string $page): JsonResponse
    {
        $rows = SiteContent::where('page_slug', $page)->get();
        $map = [];
        foreach ($rows as $row) {
            $map[$row->content_key] = $row->value;
        }
        return response()->json([
            'page' => $page,
            // (object) cast keeps the empty case a JSON object {}, not [].
            'content' => (object) $map,
        ])->header('Cache-Control', 'public, max-age=60'); // 1-min CDN-friendly cache
    }

    public function seo(string $page): JsonResponse
    {
        $row = SeoSetting::where('page_slug', $page)->first();
        return response()->json([
            'page' => $page,
            'seo' => $row,
        ])->header('Cache-Control', 'public, max-age=300');
    }
}
