<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SlackSetting;
use App\Services\SlackNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SlackSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $s = SlackSetting::current();
        return response()->json(['data' => $this->mask($s)]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'webhook_url' => ['nullable', 'url', 'max:500'],
            'channel' => ['nullable', 'string', 'max:80'],
            'username' => ['nullable', 'string', 'max:80'],
            'icon_emoji' => ['nullable', 'string', 'max:16'],
            'notify_bookings' => ['sometimes', 'boolean'],
            'notify_tracking_lookup' => ['sometimes', 'boolean'],
            'enabled' => ['sometimes', 'boolean'],
        ]);

        $s = SlackSetting::current();
        $s->fill($data)->save();

        return response()->json(['data' => $this->mask($s->fresh())]);
    }

    public function test(): JsonResponse
    {
        $ok = SlackNotification::make()->sendTest();
        return response()->json(['ok' => $ok]);
    }

    private function mask(SlackSetting $s): array
    {
        $arr = $s->toArray();
        if (!empty($arr['webhook_url'])) {
            $arr['webhook_url_masked'] = substr($arr['webhook_url'], 0, 32) . '…' . substr($arr['webhook_url'], -6);
        }
        return $arr;
    }
}
