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
        $s = SlackSetting::current();
        $ok = SlackNotification::make()->sendTest();

        // Even when the test posts successfully, real bookings will be skipped
        // unless the master toggle and per-event toggle are also on. Surface
        // that explicitly so admins don't think "test works → all good".
        $blockers = [];
        if (!$s->enabled) $blockers[] = 'enabled';
        if (!$s->notify_bookings) $blockers[] = 'notify_bookings';

        return response()->json([
            'ok' => $ok,
            'will_post_real_events' => $ok && empty($blockers),
            'blockers' => $blockers,
        ]);
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
