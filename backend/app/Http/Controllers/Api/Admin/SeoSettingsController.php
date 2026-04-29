<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SeoSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SeoSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => SeoSetting::orderBy('page_slug')->get()]);
    }

    public function show(string $page_slug): JsonResponse
    {
        $row = SeoSetting::where('page_slug', $page_slug)->first();
        return response()->json(['data' => $row]);
    }

    public function upsert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'page_slug' => ['required', 'string', 'max:80'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:320'],
            'canonical_url' => ['nullable', 'string', 'max:300'],
            'og_title' => ['nullable', 'string', 'max:200'],
            'og_description' => ['nullable', 'string', 'max:320'],
            'og_image' => ['nullable', 'string', 'max:300'],
            'og_type' => ['nullable', 'string', 'max:32'],
            'twitter_card' => ['nullable', 'string', 'max:32'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string', 'max:80'],
            'robots_index' => ['sometimes', 'boolean'],
            'robots_follow' => ['sometimes', 'boolean'],
            'extra_meta' => ['nullable', 'array'],
        ]);
        $row = SeoSetting::updateOrCreate(['page_slug' => $data['page_slug']], $data);
        return response()->json(['data' => $row->fresh()]);
    }

    public function destroy(string $page_slug): JsonResponse
    {
        SeoSetting::where('page_slug', $page_slug)->delete();
        return response()->json(['ok' => true]);
    }
}
