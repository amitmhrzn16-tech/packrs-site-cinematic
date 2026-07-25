<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardSnapshotController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // Fail closed: no token configured means the endpoint stays off, since
        // the payload carries booking names and phone numbers.
        $expected = (string) config('services.dashboard.token', '');
        if ($expected === '') {
            return response()->json(['error' => 'dashboard snapshot disabled'], 503);
        }

        $provided = (string) $request->bearerToken();
        if (! hash_equals($expected, $provided)) {
            return response()->json(['error' => 'unauthorized'], 401);
        }

        $kpis = [];
        $tasks = [];
        $activity = [];
        $health = 'green';
        $dbError = null;

        try {
            if (! Schema::hasTable('bookings')) {
                throw new \RuntimeException('bookings table missing');
            }
        } catch (\Throwable $e) {
            return response()->json([
                'health' => 'red',
                'kpis' => [],
                'open_tasks' => [],
                'recent_activity' => [],
                'error' => 'database unreachable',
            ]);
        }

        if (Schema::hasTable('bookings')) {
            $total = DB::table('bookings')->count();
            $new24 = DB::table('bookings')
                ->where('created_at', '>=', Carbon::now()->subDay())
                ->count();
            $pending = DB::table('bookings')
                ->whereIn('status', ['new', 'pending'])
                ->count();

            $kpis[] = ['label' => 'Bookings (24h)', 'value' => $new24, 'unit' => null];
            $kpis[] = ['label' => 'Pending Bookings', 'value' => $pending, 'unit' => null];
            $kpis[] = ['label' => 'Total Bookings', 'value' => $total, 'unit' => null];

            $newOnes = DB::table('bookings')
                ->whereIn('status', ['new', 'pending'])
                ->orderByDesc('created_at')
                ->limit(15)
                ->get();
            foreach ($newOnes as $b) {
                $tasks[] = [
                    'id' => 'booking:'.$b->id,
                    'title' => 'New booking — '.($b->name ?? $b->phone ?? '#'.$b->id),
                    'priority' => 'high',
                    'due_at' => null,
                    'source_url' => '/admin/bookings/'.$b->id,
                ];
                $activity[] = [
                    'ts' => $b->created_at,
                    'verb' => 'submitted booking',
                    'object' => $b->name ?? '#'.$b->id,
                    'actor' => null,
                ];
            }
        }

        if (Schema::hasTable('rates')) {
            $rateCount = DB::table('rates')->count();
            $kpis[] = ['label' => 'Active Rates', 'value' => $rateCount, 'unit' => null];
        }

        if (count($tasks) > 10) {
            $health = 'yellow';
        }

        return response()->json([
            'health' => $health,
            'kpis' => $kpis,
            'open_tasks' => $tasks,
            'recent_activity' => $activity,
        ]);
    }
}
