# Marketing Leads Integration

This document explains how to forward every Packrs-site **Book a Pickup** submission into the Marketing CRM, where it lands alongside Meta / TikTok / Google ad leads in the same `leads` table.

## Architecture

```
┌──────────────┐    POST + HMAC      ┌──────────────────┐
│  packrs-site │ ───────────────────▶│  marketing CRM   │
│  /api/v1/    │  /api/webhooks/     │  ScraperService  │
│  bookings    │  leads/website      │  ::ingest()      │
└──────────────┘                      └──────────────────┘
       │                                       │
       │                                       ▼
       │                                  ┌─────────┐
       └─ Slack notify (existing)         │  leads  │ ◀── Meta / TikTok / Google
       └─ DB save (existing)              └─────────┘
```

## Packrs-site side (already implemented in this PR)

- `App\Services\MarketingLeadDispatcher` — fire-and-forget HTTP POST with HMAC-SHA256 signature in the `X-Packrs-Signature` header. Errors are logged and swallowed so the user-facing booking response never fails.
- Wired into `BookingController::store` after the existing Slack call.
- Configured via three env vars (see `.env.example`):

```bash
MARKETING_LEADS_WEBHOOK_URL=https://marketing.example.com/api/webhooks/leads/website
MARKETING_LEADS_WEBHOOK_SECRET=use-a-long-random-string-shared-with-marketing
MARKETING_LEADS_TIMEOUT=4
```

When `MARKETING_LEADS_WEBHOOK_URL` is empty, the dispatcher is a silent no-op.

### Outbound payload

```json
{
  "id": 123,
  "name": "Sita Operator",
  "phone": "9801999999",
  "email": null,
  "address": "Pulchowk, Lalitpur",
  "business_registered": true,
  "business_type": "E-commerce / online seller",
  "avg_volume": "50 – 200 parcels / month",
  "notes": "Daily pickup at 5pm",
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0 …",
  "submitted_at": "2026-04-29T08:21:46+00:00"
}
```

Headers:
```
Content-Type: application/json
Accept: application/json
X-Packrs-Signature: sha256=<hex hmac of the raw body, secret=MARKETING_LEADS_WEBHOOK_SECRET>
```

## Marketing-side patch (apply manually)

The marketing repo lives in a separate working tree, so the receiver needs to be added there by hand. Three small additions:

### 1. Route — `routes/api.php`

Add next to the other `webhooks/leads/*` routes:

```php
Route::post('/webhooks/leads/website', [LeadWebhookController::class, 'website']);
```

### 2. Config — `config/services.php`

```php
'packrs_site' => [
    'webhook_secret' => env('PACKRS_SITE_WEBHOOK_SECRET'),
],
```

`.env`:
```bash
PACKRS_SITE_WEBHOOK_SECRET=use-the-same-long-random-string-as-on-packrs-site
```

### 3. Controller — `app/Http/Controllers/LeadWebhookController.php`

Append two methods to the existing class (alongside `meta()`, `tiktok()`, `google()`):

```php
/**
 * POST /api/webhooks/leads/website — Packrs marketing site (book-a-pickup form).
 *
 * Inbound shape (signed via X-Packrs-Signature: sha256=<hmac>):
 *   { id, name, phone, email, address, business_registered, business_type,
 *     avg_volume, notes, ip_address, user_agent, submitted_at }
 */
public function website(Request $request, ScraperService $scraper): JsonResponse
{
    $this->verifyWebsiteSignature($request);

    $payload   = $request->all();
    $bookingId = $payload['id'] ?? null;

    $bizParts = array_filter([
        $payload['business_type'] ?? null,
        !empty($payload['avg_volume']) ? "vol: {$payload['avg_volume']}" : null,
        isset($payload['business_registered']) && $payload['business_registered']
            ? 'registered' : 'unregistered',
    ]);

    $records = [[
        'name'           => $payload['name']    ?? null,
        'email'          => $payload['email']   ?? null,
        'phone'          => $payload['phone']   ?? null,
        'source_handle'  => $bookingId ? "packrs-site:booking:{$bookingId}" : null,
        'location_label' => $payload['address'] ?? null,
        'bio'            => $bizParts ? implode(' · ', $bizParts) : null,
        'raw'            => $payload,
    ]];

    $result = $scraper->ingest('website', 'website:book-pickup', $records);

    $this->notifyWebhook(
        'Packrs Website',
        'website',
        $bookingId ? "booking:{$bookingId}" : null,
        $result,
    );

    Log::info('webhook.website.ingested', [
        'booking_id' => $bookingId,
        'result'     => $result,
    ]);

    return response()->json(['ok' => true, ...$result]);
}

private function verifyWebsiteSignature(Request $request): void
{
    $secret = (string) config('services.packrs_site.webhook_secret');
    if ($secret === '') {
        return; // Skip in dev when not configured
    }

    $sig      = (string) $request->header('X-Packrs-Signature', '');
    $expected = 'sha256=' . hash_hmac('sha256', $request->getContent(), $secret);
    if (!hash_equals($expected, $sig)) {
        abort(401, 'Invalid Packrs website signature');
    }
}
```

## How it shows up in the CRM

A website-sourced lead lands as:

| Field | Value |
|---|---|
| `source` | `website` |
| `source_handle` | `packrs-site:booking:{id}` |
| `scrape_keyword` | `website:book-pickup` |
| `name` / `phone` / `email` | from the form |
| `location_label` | full pickup address |
| `bio` | summary chip — e.g. *"E-commerce / online seller · vol: 50 – 200 parcels / month · registered"* |
| `raw_scraped_payload` | the full booking JSON |
| `status` | `new` (default) — same as ad leads |

`ScraperService::ingest()` already dedupes on email > phone > (source + handle), so retries are safe.

## Testing the round-trip

```bash
# 1. Generate a shared secret
SECRET=$(openssl rand -hex 32)

# 2. Set on packrs-site/backend/.env
echo "MARKETING_LEADS_WEBHOOK_URL=http://localhost:8001/api/webhooks/leads/website" >> backend/.env
echo "MARKETING_LEADS_WEBHOOK_SECRET=$SECRET" >> backend/.env

# 3. Set on marketing/.env
echo "PACKRS_SITE_WEBHOOK_SECRET=$SECRET" >> ../marketing/.env

# 4. Both servers running
cd backend && php artisan serve --port=8000 &
cd ../../marketing && php artisan serve --port=8001 &

# 5. Submit a booking via the public form (or curl)
curl -sX POST http://127.0.0.1:8000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{"name":"CRM Smoke","phone":"9800000099","address":"Hadigaun","business_registered":false,"business_type":"Individual / personal","avg_volume":"Just trying it out (1–5 / month)"}'

# 6. Confirm it landed in the marketing leads table
cd ../marketing && php artisan tinker --execute='echo \App\Models\Lead::where("source","website")->latest()->value("name");'
```

## Failure modes (all non-fatal)

| Scenario | Effect |
|---|---|
| `MARKETING_LEADS_WEBHOOK_URL` not set | Dispatcher silently no-ops |
| Marketing endpoint returns 4xx/5xx | Logged via `marketing.lead_dispatch_failed`; booking still saved + Slack still fires |
| Marketing endpoint times out | Logged via `marketing.lead_dispatch_threw`; booking still saved |
| HMAC mismatch | Marketing returns 401; logged on both sides; booking still saved |

In every case the user-facing booking flow is unaffected.
