<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Rate;
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
        ])->header('Cache-Control', 'public, max-age=10'); // short TTL so admin edits land fast
    }

    public function seo(string $page): JsonResponse
    {
        $row = SeoSetting::where('page_slug', $page)->first();
        return response()->json([
            'page' => $page,
            'seo' => $row,
        ])->header('Cache-Control', 'public, max-age=10');
    }

    /**
     * Public list of active rates, used by the rate calculator on /rates and
     * the booking form. Shape mirrors what the calculator already expects so
     * it can replace the static /data/rates.json file directly.
     */
    public function rates(): JsonResponse
    {
        $rows = Rate::query()
            ->where('active', true)
            ->orderBy('to_location')
            ->orderBy('service_type')
            ->get([
                'from_location', 'to_location', 'service_type',
                'base_rate', 'base_kg_limit',
                'additional_kg_mode', 'additional_kg_rate',
                'areas_covered', 'contact_number', 'active',
            ]);

        return response()->json($rows)
            ->header('Cache-Control', 'public, max-age=10');
    }
}
