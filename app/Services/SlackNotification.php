<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\SlackSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Slack incoming-webhook sender. Configure once via the admin Slack settings
 * page; all calls become no-ops if Slack isn't configured/enabled, so booking
 * submission never fails because of a Slack outage.
 */
class SlackNotification
{
    public function __construct(private SlackSetting $settings) {}

    public static function make(): self
    {
        return new self(SlackSetting::current());
    }

    /** Booking just landed — fire a "New Pickup" alert to the configured channel. */
    public function notifyNewBooking(Booking $b): bool
    {
        $s = $this->settings;
        if (!$s->webhook_url) {
            Log::info('Slack notify skipped — no webhook_url configured', ['booking_id' => $b->id]);
            return false;
        }
        if (!$s->enabled) {
            Log::info('Slack notify skipped — integration disabled (toggle Enable in admin)', ['booking_id' => $b->id]);
            return false;
        }
        if (!$s->notify_bookings) {
            Log::info('Slack notify skipped — notify_bookings is off', ['booking_id' => $b->id]);
            return false;
        }

        $payload = $this->buildBookingPayload($b);
        return $this->send($payload);
    }

    /** Quick test — used by the admin "Send test" button. */
    public function sendTest(string $message = ':package: *Slack test from Packrs admin*'): bool
    {
        $s = $this->settings;
        if (!$s->webhook_url) return false;

        return $this->send([
            'text' => $message,
            'username' => $s->username,
            'icon_emoji' => $s->icon_emoji,
            'channel' => $s->channel ?: null,
        ]);
    }

    private function buildBookingPayload(Booking $b): array
    {
        $s = $this->settings;
        $registered = $b->business_registered ? 'Yes' : 'No';

        return [
            'username' => $s->username,
            'icon_emoji' => $s->icon_emoji,
            'channel' => $s->channel ?: null,
            'text' => "*New Pickup Request* — {$b->name}",
            'blocks' => [
                [
                    'type' => 'header',
                    'text' => ['type' => 'plain_text', 'text' => "🚚  New Pickup Request"],
                ],
                [
                    'type' => 'section',
                    'fields' => [
                        ['type' => 'mrkdwn', 'text' => "*Name*\n{$b->name}"],
                        ['type' => 'mrkdwn', 'text' => "*Phone*\n<tel:{$b->phone}|{$b->phone}>"],
                        ['type' => 'mrkdwn', 'text' => "*Address*\n{$b->address}"],
                        ['type' => 'mrkdwn', 'text' => "*Business registered*\n{$registered}"],
                        ['type' => 'mrkdwn', 'text' => "*Business type*\n" . ($b->business_type ?: '—')],
                        ['type' => 'mrkdwn', 'text' => "*Avg volume*\n" . ($b->avg_volume ?: '—')],
                    ],
                ],
                $b->notes ? [
                    'type' => 'section',
                    'text' => ['type' => 'mrkdwn', 'text' => "*Notes*\n" . $b->notes],
                ] : null,
                [
                    'type' => 'context',
                    'elements' => [[
                        'type' => 'mrkdwn',
                        'text' => "Submitted from `{$b->source}` · " . optional($b->created_at)->toDayDateTimeString(),
                    ]],
                ],
            ],
        ];
    }

    private function send(array $payload): bool
    {
        $payload = array_filter($payload, fn ($v) => $v !== null);
        if (isset($payload['blocks'])) {
            $payload['blocks'] = array_values(array_filter($payload['blocks']));
        }

        try {
            $res = Http::timeout(4)->post($this->settings->webhook_url, $payload);
            $ok = $res->successful();
            if ($ok) {
                $this->settings->forceFill([
                    'last_sent_at' => now(),
                    'total_sent' => $this->settings->total_sent + 1,
                ])->save();
            } else {
                Log::warning('Slack webhook failed', ['status' => $res->status(), 'body' => $res->body()]);
            }
            return $ok;
        } catch (\Throwable $e) {
            Log::warning('Slack webhook threw', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
