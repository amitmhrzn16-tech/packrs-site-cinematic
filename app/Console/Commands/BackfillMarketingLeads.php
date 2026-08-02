<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\MarketingLeadDispatcher;
use Illuminate\Console\Command;

/**
 * Pushes pickup bookings that predate the marketing CRM hookup (or that were
 * submitted while the CRM was unreachable) into the leads pipeline.
 *
 * New bookings forward themselves from BookingController; this is only for
 * catching up. Re-running is safe: the CRM's /webhooks/leads/website endpoint
 * dedupes on phone and keys its notes block by booking id, so a booking that
 * already landed is counted as a duplicate rather than written twice.
 */
class BackfillMarketingLeads extends Command
{
    protected $signature = 'marketing:backfill-leads
        {--since= : Only bookings created on/after this date (Y-m-d)}
        {--limit=0 : Stop after this many bookings (0 = no limit)}
        {--dry-run : List what would be sent without sending it}';

    protected $description = 'Forward existing pickup bookings to the marketing CRM as leads';

    public function handle(): int
    {
        if (! config('services.marketing.webhook_url')) {
            $this->error('MARKETING_LEADS_WEBHOOK_URL is not set — nothing would be sent.');

            return self::FAILURE;
        }

        $query = Booking::query()->oldest('id');

        if ($since = $this->option('since')) {
            $query->whereDate('created_at', '>=', $since);
        }

        if ($limit = (int) $this->option('limit')) {
            $query->limit($limit);
        }

        $total = (clone $query)->count();
        if ($total === 0) {
            $this->info('No bookings matched — nothing to backfill.');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->info("Dry run — {$total} booking(s) would be sent:");
            $query->each(fn (Booking $b) => $this->line("  #{$b->id}  {$b->name}  {$b->phone}  {$b->created_at}"));

            return self::SUCCESS;
        }

        $dispatcher = MarketingLeadDispatcher::make();
        $sent = $failed = 0;

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $query->each(function (Booking $booking) use ($dispatcher, &$sent, &$failed, $bar) {
            // The dispatcher logs and swallows its own HTTP errors, so a single
            // unreachable moment never aborts the rest of the backfill.
            $dispatcher->dispatch($booking) ? $sent++ : $failed++;
            $bar->advance();
        });

        $bar->finish();
        $this->newLine(2);

        $this->info("Sent: {$sent}");
        if ($failed > 0) {
            $this->warn("Failed: {$failed} — see the log for marketing.lead_dispatch_* entries, then re-run to retry.");
        }

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
