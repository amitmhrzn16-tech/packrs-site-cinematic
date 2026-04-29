<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class AnalyticsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $start = Carbon::now()->subDays(29)->startOfDay();

        // Group bookings by day for the last 30 days, fill in zeros for missing days.
        $rows = Booking::query()
            ->where('created_at', '>=', $start)
            ->selectRaw('date(created_at) as day, count(*) as count')
            ->groupBy('day')
            ->pluck('count', 'day')
            ->toArray();

        $series = [];
        for ($i = 29; $i >= 0; $i--) {
            $d = Carbon::now()->subDays($i)->toDateString();
            $series[] = ['date' => $d, 'count' => (int) ($rows[$d] ?? 0)];
        }

        $byStatus = Booking::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $byBusinessType = Booking::query()
            ->whereNotNull('business_type')
            ->selectRaw('business_type, count(*) as count')
            ->groupBy('business_type')
            ->orderByDesc('count')
            ->limit(8)
            ->get();

        return response()->json([
            'totals' => [
                'all_time' => Booking::count(),
                'this_week' => Booking::where('created_at', '>=', Carbon::now()->subWeek())->count(),
                'today' => Booking::whereDate('created_at', today())->count(),
                'new' => Booking::where('status', 'new')->count(),
                'converted' => Booking::where('status', 'converted')->count(),
            ],
            'series_30d' => $series,
            'by_status' => $byStatus,
            'top_business_types' => $byBusinessType,
        ]);
    }
}
