<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /** POST /api/admin/media — upload an image, return its public URL. */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:5120'], // 5 MB
        ]);

        $file = $request->file('file');
        $name = Str::random(12) . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName());
        $path = $file->storeAs('media', $name, 'public');

        return response()->json([
            'ok' => true,
            'path' => $path,
            'url' => Storage::url($path),    // /storage/media/{name}
            'filename' => $name,
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
        ], 201);
    }

    /** GET /api/admin/media — list previously uploaded files. */
    public function index(): JsonResponse
    {
        $files = collect(Storage::disk('public')->files('media'))
            ->map(fn ($p) => [
                'path' => $p,
                'url' => Storage::url($p),
                'name' => basename($p),
                'size' => Storage::disk('public')->size($p),
                'last_modified' => Storage::disk('public')->lastModified($p),
            ])
            ->sortByDesc('last_modified')
            ->values();
        return response()->json(['data' => $files]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate(['path' => ['required', 'string']]);
        $path = ltrim($request->input('path'), '/');
        if (!str_starts_with($path, 'media/')) {
            return response()->json(['message' => 'Invalid path.'], 422);
        }
        Storage::disk('public')->delete($path);
        return response()->json(['ok' => true]);
    }
}
