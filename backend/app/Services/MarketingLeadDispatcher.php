<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Forwards every new pickup booking to the marketing leads CRM so it shows up
 * alongside Meta/TikTok/Google ad leads.
 *
 * The dispatcher is a best-effort fire-and-forget: any HTTP error is logged
 * and swallowed so the user-facing booking response never fails because of
 * a downstream CRM hiccup.
 *
 * Configure via .env:
 *   MARKETING_LEADS_WEBHOOK_URL    = https://marketing.example/api/webhooks/leads/website
 *   MARKETING_LEADS_WEBHOOK_SECRET = (a long random string, also set on the marketing side)
 */
class MarketingLeadDispatcher
{
    public static function make(): self
    {
        return new self(
            url:     (string) (config('services.marketing.webhook_url') ?? ''),
            secret:  (string) (config('services.marketing.webhook_secret') ?? ''),
            timeout: (int)    (config('services.marketing.timeout') ?? 4),
        );
    }

    public function __construct(
        private string $url,
        private string $secret,
        private int $timeout,
    ) {}

    /** Returns true if the dispatcher actually sent the payload, false otherwise. */
    public function dispatch(Booking $b): bool
    {
        if ($this->url === '') {
            return false; // Not configured — silent no-op
        }

        $payload = [
            'id'                  => $b->id,
            'name'                => $b->name,
            'phone'               => $b->phone,
            'email'               => null,                  // public form doesn't capture email yet
            'address'             => $b->address,
            'business_registered' => (bool) $b->business_registered,
            'business_type'       => $b->business_type,
            'avg_volume'          => $b->avg_volume,
            'notes'               => $b->notes,
            'ip_address'          => $b->ip_address,
            'user_agent'          => $b->user_agent,
            'submitted_at'        => optional($b->created_at)->toIso8601String(),
        ];

        $body = json_encode($payload, JSON_UNESCAPED_UNICODE);
        $headers = ['Content-Type' => 'application/json', 'Accept' => 'application/json'];

        if ($this->secret !== '') {
            $headers['X-Packrs-Signature'] = 'sha256=' . hash_hmac('sha256', $body, $this->secret);
        }

        try {
            $res = Http::withHeaders($headers)
                ->timeout($this->timeout)
                ->withBody($body, 'application/json')
                ->post($this->url);

            if (!$res->successful()) {
                Log::warning('marketing.lead_dispatch_failed', [
                    'booking_id' => $b->id,
                    'status'     => $res->status(),
                    'body'       => substr($res->body(), 0, 500),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('marketing.lead_dispatch_threw', [
                'booking_id' => $b->id,
                'error'      => $e->getMessage(),
            ]);
            return false;
        }
    }
}
