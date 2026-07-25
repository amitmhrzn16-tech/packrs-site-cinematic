<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Nepal Rastra Bank daily foreign-exchange rates.
 *
 * The Economy international tariff is published in USD but billed in NPR at
 * the NRB daily rate, so /rates/international needs today's rate to show a
 * customer what they will actually pay. NRB publishes once a day (and skips
 * public holidays), hence the 6-hour cache and the look-back window.
 *
 * Some hosts block outbound HTTP from PHP, or ship without a CA bundle, so a
 * failure here is a deployment fact rather than a bug. Three things follow
 * from that: the reason is reported in the response so it can be diagnosed
 * without server logs, the last good rate is kept forever as a fallback, and
 * `services.nrb.usd_npr_fallback` can supply a manual rate as a last resort.
 */
class ForexController extends Controller
{
    private const ENDPOINT = 'https://www.nrb.org.np/api/forex/v1/rates';
    private const TTL_SECONDS = 21600;   // 6 hours
    private const LOOKBACK_DAYS = 10;    // covers holiday gaps in publication

    /** Set by fetch() so the response can explain a failure. */
    private ?string $reason = null;

    /**
     * GET /api/v1/forex/{iso3?}
     *
     * Returns the most recently published buy/sell rate for one currency.
     * On upstream failure the last good value is served with stale=true so
     * the calculator degrades to an old rate rather than to nothing.
     */
    public function show(string $iso3 = 'USD'): JsonResponse
    {
        $iso3 = strtoupper($iso3);

        if (! preg_match('/^[A-Z]{3}$/', $iso3)) {
            return response()->json(['message' => 'Invalid currency code.'], 422);
        }

        $fresh = Cache::remember("forex.{$iso3}", self::TTL_SECONDS, function () use ($iso3) {
            return $this->fetch($iso3);
        });

        if ($fresh) {
            // Keep a copy that never expires, to fall back on when NRB is down.
            Cache::forever("forex.{$iso3}.last", $fresh);

            return response()->json($fresh)
                ->header('Cache-Control', 'public, max-age=3600');
        }

        // Nothing fresh — don't cache the failure, so the next hit retries.
        Cache::forget("forex.{$iso3}");

        $stale = Cache::get("forex.{$iso3}.last");

        if ($stale) {
            return response()->json($stale + ['stale' => true])
                ->header('Cache-Control', 'public, max-age=300');
        }

        if ($manual = $this->manualFallback($iso3)) {
            return response()->json($manual)
                ->header('Cache-Control', 'public, max-age=300');
        }

        return response()->json([
            'message' => 'Exchange rate is temporarily unavailable.',
            // Not sensitive, and the only way to tell a blocked host from a
            // missing CA bundle without shell access to the server.
            'reason' => $this->reason ?? 'unknown',
        ], 503)->header('Cache-Control', 'no-store');
    }

    /**
     * A rate configured by hand on the server, for hosts that can never reach
     * NRB. Flagged `manual` so the UI can label it as not today's NRB figure.
     */
    private function manualFallback(string $iso3): ?array
    {
        if ($iso3 !== 'USD') {
            return null;
        }

        $rate = config('services.nrb.usd_npr_fallback');

        if (! is_numeric($rate) || (float) $rate <= 0) {
            return null;
        }

        return [
            'currency' => 'USD',
            'unit' => 1,
            'buy' => (float) $rate,
            'sell' => (float) $rate,
            'date' => null,
            'source' => 'manual',
            'stale' => true,
        ];
    }

    /**
     * Pull the currency's latest entry from NRB. Returns null on any failure —
     * a missing exchange rate must never take the rate page down with it — and
     * records why in $this->reason.
     */
    private function fetch(string $iso3): ?array
    {
        try {
            $res = Http::timeout((int) config('services.nrb.timeout', 6))
                ->retry(2, 250, throw: false)
                ->withOptions(['verify' => filter_var(
                    config('services.nrb.verify', true),
                    FILTER_VALIDATE_BOOL
                )])
                // NRB sits behind a WAF that is friendlier to a named client
                // than to the default Guzzle agent.
                ->withHeaders([
                    'User-Agent' => 'PackrsCourier/1.0 (+https://packrscourier.com.np)',
                    'Accept' => 'application/json',
                ])
                ->get(self::ENDPOINT, [
                    'from' => now()->subDays(self::LOOKBACK_DAYS)->toDateString(),
                    'to' => now()->toDateString(),
                    'per_page' => self::LOOKBACK_DAYS + 1,
                    'page' => 1,
                ]);

            if (! $res->successful()) {
                $this->reason = 'http_'.$res->status();
                Log::warning('NRB forex fetch failed', ['status' => $res->status()]);

                return null;
            }

            // Payload is ascending by date; the last entry is the newest.
            $days = $res->json('data.payload') ?? [];
            $latest = end($days);

            if (! $latest) {
                $this->reason = 'empty_payload';

                return null;
            }

            foreach ($latest['rates'] ?? [] as $rate) {
                if (($rate['currency']['iso3'] ?? null) !== $iso3) {
                    continue;
                }

                return [
                    'currency' => $iso3,
                    'unit' => (int) ($rate['currency']['unit'] ?? 1),
                    'buy' => (float) $rate['buy'],
                    'sell' => (float) $rate['sell'],
                    'date' => $latest['date'] ?? null,
                    'source' => 'Nepal Rastra Bank',
                ];
            }

            $this->reason = 'currency_not_published';

            return null;
        } catch (\Throwable $e) {
            $this->reason = $this->classify($e->getMessage());
            Log::warning('NRB forex fetch threw', ['message' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Turn a Guzzle/cURL message into a short code. Each one points at a
     * different fix, which is the whole reason for reporting it.
     */
    private function classify(string $message): string
    {
        $m = strtolower($message);

        return match (true) {
            str_contains($m, 'ssl') || str_contains($m, 'certificate') => 'tls_no_ca_bundle',
            str_contains($m, 'could not resolve') || str_contains($m, 'resolve host') => 'dns_failure',
            str_contains($m, 'timed out') || str_contains($m, 'timeout') => 'timeout',
            str_contains($m, 'connection refused') => 'connection_refused',
            str_contains($m, 'failed to connect') || str_contains($m, 'network') => 'outbound_blocked',
            default => 'request_failed',
        };
    }
}
