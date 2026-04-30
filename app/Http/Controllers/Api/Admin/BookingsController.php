<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Booking::query()->orderByDesc('created_at');

        if ($search = trim((string) $request->query('q'))) {
            $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }
        if ($status = $request->query('status')) {
            $q->where('status', $status);
        }

        return response()->json(['data' => $q->paginate((int) $request->query('per_page', 25))]);
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', 'in:new,contacted,converted,dropped'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);
        $booking->update($data);
        return response()->json(['data' => $booking->fresh()]);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        $booking->delete();
        return response()->json(['ok' => true]);
    }
}
