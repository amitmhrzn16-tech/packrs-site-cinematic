<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
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
            ->pushStatus(500);

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
            ->assertJsonPath('message', 'Exchange rate is temporarily unavailable.');
    }

    public function test_a_failed_fetch_is_not_cached(): void
    {
        Http::fakeSequence('www.nrb.org.np/*')
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
