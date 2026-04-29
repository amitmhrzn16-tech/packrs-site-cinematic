<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteContentController extends Controller
{
    /** GET /api/admin/content?page=home — all content for one page. */
    public function index(Request $request): JsonResponse
    {
        $q = SiteContent::query()->orderBy('page_slug')->orderBy('sort_order')->orderBy('content_key');
        if ($page = $request->query('page')) $q->where('page_slug', $page);
        return response()->json(['data' => $q->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'page_slug' => ['required', 'string', 'max:80'],
            'content_key' => ['required', 'string', 'max:80'],
            'type' => ['nullable', 'in:text,html,image,url'],
            'value' => ['nullable', 'string'],
            'label' => ['nullable', 'string', 'max:200'],
            'sort_order' => ['nullable', 'integer'],
        ]);
        $content = SiteContent::updateOrCreate(
            ['page_slug' => $data['page_slug'], 'content_key' => $data['content_key']],
            $data
        );
        return response()->json(['data' => $content]);
    }

    public function update(Request $request, SiteContent $content): JsonResponse
    {
        $data = $request->validate([
            'value' => ['nullable', 'string'],
            'type' => ['nullable', 'in:text,html,image,url'],
            'label' => ['nullable', 'string', 'max:200'],
            'sort_order' => ['nullable', 'integer'],
        ]);
        $content->update($data);
        return response()->json(['data' => $content->fresh()]);
    }

    public function destroy(SiteContent $content): JsonResponse
    {
        $content->delete();
        return response()->json(['ok' => true]);
    }
}
