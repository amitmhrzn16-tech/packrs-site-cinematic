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
 * Some hosts block outbound HTTP from PHP, so a failure here can be a
 * deployment fact rather than a bug. Three things follow from that: the reason
 * is reported in the response so it can be diagnosed without server logs, the
 * last good rate is kept forever as a fallback, and
 * `services.nrb.usd_npr_fallback` can supply a manual rate as a last resort.
 *
 * NRB's incomplete certificate chain is the exception — see verifyOption().
 * That one looked like a host misconfiguration but is fixed in the app.
 */
class ForexController extends Controller
{
    private const ENDPOINT = 'https://www.nrb.org.np/api/forex/v1/rates';
    private const TTL_SECONDS = 21600;   // 6 hours
    private const LOOKBACK_DAYS = 10;    // covers holiday gaps in publication

    /**
     * How long to remember that NRB failed.
     *
     * NRB's API can accept the TCP connection and then never answer, so a
     * failure costs the full timeout plus retries — around 18 seconds. Without
     * this, every visitor who opens the Economy tab pays that wait and adds
     * another hanging request to a host that is already struggling. Short
     * enough that recovery is picked up within a couple of minutes.
     */
    private const FAILURE_TTL_SECONDS = 120;

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

        $cached = Cache::get("forex.{$iso3}");

        if (is_array($cached) && isset($cached['failed'])) {
            // A recent attempt already failed. Don't hang this request too.
            $fresh = null;
            $this->reason = $cached['reason'] ?? null;
        } elseif (is_array($cached)) {
            $fresh = $cached;
        } else {
            $fresh = $this->fetch($iso3);

            Cache::put(
                "forex.{$iso3}",
                $fresh ?: ['failed' => true, 'reason' => $this->reason],
                $fresh ? self::TTL_SECONDS : self::FAILURE_TTL_SECONDS
            );
        }

        if ($fresh) {
            // Keep a copy that never expires, to fall back on when NRB is down.
            Cache::forever("forex.{$iso3}.last", $fresh);

            return response()->json($fresh)
                ->header('Cache-Control', 'public, max-age=3600');
        }

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
     * What to hand Guzzle for TLS verification.
     *
     * NRB serves its leaf certificate without the GeoTrust intermediate above
     * it, so OpenSSL cannot build a path to any root and the request dies with
     * `unable to get local issuer certificate` — on every host, however well
     * its CA store is set up. Browsers and the curl CLI paper over this by
     * fetching the missing issuer over AIA; PHP does not.
     *
     * So point cURL at the chain we ship instead. It carries the intermediate
     * NRB omits plus the one root it chains to, which is why the app's own
     * bundle is used here rather than the system store.
     *
     * Returns false only when NRB_VERIFY_SSL is explicitly disabled, which
     * leaves the rate unauthenticated — the escape hatch of last resort.
     */
    private function verifyOption(): string|bool
    {
        $verify = filter_var(
            config('services.nrb.verify', true),
            FILTER_VALIDATE_BOOL
        );

        if (! $verify) {
            return false;
        }

        $caFile = config('services.nrb.ca_file') ?: resource_path('certs/nrb-ca.pem');

        // If the shipped chain ever goes missing, fall back to the host's own
        // store: it will most likely fail, but as a reported 503 rather than
        // an unverified rate.
        return is_file($caFile) ? $caFile : true;
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
                ->withOptions(['verify' => $this->verifyOption()])
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
            // Distinct from a missing CA store, and fixed in a different place:
            // this one means the chain we ship no longer matches what NRB sends.
            str_contains($m, 'local issuer') => 'tls_chain_incomplete',
            str_contains($m, 'ssl') || str_contains($m, 'certificate') => 'tls_no_ca_bundle',
            str_contains($m, 'could not resolve') || str_contains($m, 'resolve host') => 'dns_failure',
            str_contains($m, 'timed out') || str_contains($m, 'timeout') => 'timeout',
            str_contains($m, 'connection refused') => 'connection_refused',
            str_contains($m, 'failed to connect') || str_contains($m, 'network') => 'outbound_blocked',
            default => 'request_failed',
        };
    }
}
