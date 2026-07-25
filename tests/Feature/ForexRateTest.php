<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ForexRateTest extends TestCase
{
    /** Trimmed copy of a real NRB response: two days, ascending by date. */
    private function nrbPayload(): array
    {
        return [
            'status' => ['code' => 200],
            'data' => ['payload' => [
                [
                    'date' => '2026-07-24',
                    'rates' => [
                        ['currency' => ['iso3' => 'INR', 'name' => 'Indian Rupee', 'unit' => 100], 'buy' => '160.00', 'sell' => '160.15'],
                        ['currency' => ['iso3' => 'USD', 'name' => 'U.S. Dollar', 'unit' => 1], 'buy' => '154.22', 'sell' => '154.82'],
                    ],
                ],
                [
                    'date' => '2026-07-25',
                    'rates' => [
                        ['currency' => ['iso3' => 'INR', 'name' => 'Indian Rupee', 'unit' => 100], 'buy' => '160.00', 'sell' => '160.15'],
                        ['currency' => ['iso3' => 'USD', 'name' => 'U.S. Dollar', 'unit' => 1], 'buy' => '154.21', 'sell' => '154.81'],
                        ['currency' => ['iso3' => 'EUR', 'name' => 'European Euro', 'unit' => 1], 'buy' => '176.00', 'sell' => '176.69'],
                    ],
                ],
            ]],
        ];
    }

    public function test_it_returns_the_latest_published_usd_rate(): void
    {
        Http::fake(['www.nrb.org.np/*' => Http::response($this->nrbPayload())]);

        $this->getJson('/api/v1/forex/USD')
            ->assertOk()
            // 07-25 is the newest day in the payload, not 07-24.
            ->assertJson([
                'currency' => 'USD',
                'unit' => 1,
                'buy' => 154.21,
                'sell' => 154.81,
                'date' => '2026-07-25',
                'source' => 'Nepal Rastra Bank',
            ]);
    }

    public function test_it_defaults_to_usd_and_serves_other_currencies(): void
    {
        Http::fake(['www.nrb.org.np/*' => Http::response($this->nrbPayload())]);

        $this->getJson('/api/v1/forex')->assertOk()->assertJsonPath('currency', 'USD');

        $this->getJson('/api/v1/forex/eur')
            ->assertOk()
            ->assertJsonPath('currency', 'EUR')
            ->assertJsonPath('sell', 176.69);
    }

    public function test_it_keeps_the_unit_so_per_100_quotes_are_not_read_as_per_1(): void
    {
        Http::fake(['www.nrb.org.np/*' => Http::response($this->nrbPayload())]);

        $this->getJson('/api/v1/forex/INR')
            ->assertOk()
            ->assertJsonPath('unit', 100)
            ->assertJsonPath('sell', 160.15);
    }

    public function test_it_caches_so_one_visitor_per_six_hours_hits_nrb(): void
    {
        Http::fake(['www.nrb.org.np/*' => Http::response($this->nrbPayload())]);

        $this->getJson('/api/v1/forex/USD')->assertOk();
        $this->getJson('/api/v1/forex/USD')->assertOk();

        Http::assertSentCount(1);
    }

    public function test_it_falls_back_to_the_last_known_rate_when_nrb_is_down(): void
    {
        // A sequence, not two fake() calls: repeated stubs for one pattern merge
        // and the first registered wins, so the outage would never be seen.
        Http::fakeSequence('www.nrb.org.np/*')
            ->push($this->nrbPayload())
            ->whenEmpty(Http::response('', 500));

        $this->getJson('/api/v1/forex/USD')->assertOk();

        // Expire the fresh window, leaving only the forever copy.
        Cache::forget('forex.USD');

        $this->getJson('/api/v1/forex/USD')
            ->assertOk()
            ->assertJsonPath('sell', 154.81)
            ->assertJsonPath('stale', true);
    }

    public function test_it_reports_unavailable_rather_than_guessing_a_rate(): void
    {
        Http::fake(['www.nrb.org.np/*' => Http::response('', 500)]);

        $this->getJson('/api/v1/forex/USD')
            ->assertStatus(503)
            ->assertJsonPath('message', 'Exchange rate is temporarily unavailable.')
            ->assertJsonPath('reason', 'http_500');
    }

    /**
     * Each connection failure gets its own run: stubs registered for the same
     * URL pattern merge, and the first one registered wins.
     */
    #[DataProvider('connectionFailures')]
    public function test_it_names_the_failure_so_the_cause_can_be_told_apart(string $curlMessage, string $expected): void
    {
        Http::fake(fn () => throw new \Illuminate\Http\Client\ConnectionException($curlMessage));

        $this->getJson('/api/v1/forex/USD')
            ->assertStatus(503)
            ->assertJsonPath('reason', $expected);
    }

    public static function connectionFailures(): array
    {
        return [
            'no CA bundle' => [
                'cURL error 60: SSL certificate problem: unable to get local issuer certificate',
                'tls_no_ca_bundle',
            ],
            'outbound blocked' => [
                'cURL error 7: Failed to connect to www.nrb.org.np port 443: Connection timed out',
                'timeout',
            ],
            'no DNS' => [
                'cURL error 6: Could not resolve host: www.nrb.org.np',
                'dns_failure',
            ],
            'refused' => [
                'cURL error 7: Connection refused',
                'connection_refused',
            ],
        ];
    }

    public function test_a_configured_fallback_keeps_npr_on_the_page_when_nrb_is_unreachable(): void
    {
        config(['services.nrb.usd_npr_fallback' => 152.5]);
        Http::fake(['www.nrb.org.np/*' => Http::response('', 500)]);

        $this->getJson('/api/v1/forex/USD')
            ->assertOk()
            ->assertJsonPath('sell', 152.5)
            // Labelled, so the UI never passes it off as today's NRB figure.
            ->assertJsonPath('source', 'manual')
            ->assertJsonPath('stale', true)
            ->assertJsonPath('date', null);
    }

    public function test_a_live_rate_always_beats_the_configured_fallback(): void
    {
        config(['services.nrb.usd_npr_fallback' => 152.5]);
        Http::fake(['www.nrb.org.np/*' => Http::response($this->nrbPayload())]);

        $this->getJson('/api/v1/forex/USD')
            ->assertOk()
            ->assertJsonPath('sell', 154.81)
            ->assertJsonPath('source', 'Nepal Rastra Bank');
    }

    public function test_a_nonsense_fallback_is_ignored_rather_than_priced_in(): void
    {
        Http::fake(['www.nrb.org.np/*' => Http::response('', 500)]);

        foreach (['', 'abc', 0, -5] as $bad) {
            Cache::flush();
            config(['services.nrb.usd_npr_fallback' => $bad]);
            $this->getJson('/api/v1/forex/USD')->assertStatus(503);
        }
    }

    public function test_a_failed_fetch_is_not_cached(): void
    {
        // Two 500s, because the controller retries once before giving up.
        Http::fakeSequence('www.nrb.org.np/*')
            ->pushStatus(500)
            ->pushStatus(500)
            ->push($this->nrbPayload());

        $this->getJson('/api/v1/forex/USD')->assertStatus(503);

        // The next visitor must retry rather than inherit the failure for 6 hours.
        $this->getJson('/api/v1/forex/USD')->assertOk()->assertJsonPath('sell', 154.81);
    }

    public function test_it_rejects_a_malformed_currency_code(): void
    {
        Http::fake();

        $this->getJson('/api/v1/forex/US1')->assertStatus(422);
        $this->getJson('/api/v1/forex/DOLLAR')->assertStatus(422);

        Http::assertNothingSent();
    }

    public function test_a_currency_nrb_does_not_publish_is_unavailable_not_a_wrong_number(): void
    {
        Http::fake(['www.nrb.org.np/*' => Http::response($this->nrbPayload())]);

        $this->getJson('/api/v1/forex/ZAR')->assertStatus(503);
    }
}
