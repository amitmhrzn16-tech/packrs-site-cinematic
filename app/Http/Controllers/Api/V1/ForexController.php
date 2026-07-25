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
 */
class ForexController extends Controller
{
    private const ENDPOINT = 'https://www.nrb.org.np/api/forex/v1/rates';
    private const TTL_SECONDS = 21600;   // 6 hours
    private const LOOKBACK_DAYS = 10;    // covers holiday gaps in publication

    /**
     * GET /api/v1/forex/{iso3}
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

        return response()->json([
            'message' => 'Exchange rate is temporarily unavailable.',
        ], 503);
    }

    /**
     * Pull the currency's latest entry from NRB. Returns null on any failure —
     * a missing exchange rate must never take the rate page down with it.
     */
    private function fetch(string $iso3): ?array
    {
        try {
            $res = Http::timeout(6)->acceptJson()->get(self::ENDPOINT, [
                'from' => now()->subDays(self::LOOKBACK_DAYS)->toDateString(),
                'to' => now()->toDateString(),
                'per_page' => self::LOOKBACK_DAYS + 1,
                'page' => 1,
            ]);

            if (! $res->successful()) {
                Log::warning('NRB forex fetch failed', ['status' => $res->status()]);

                return null;
            }

            // Payload is ascending by date; the last entry is the newest.
            $days = $res->json('data.payload') ?? [];
            $latest = end($days);

            if (! $latest) {
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

            return null;
        } catch (\Throwable $e) {
            Log::warning('NRB forex fetch threw', ['message' => $e->getMessage()]);

            return null;
        }
    }
}
