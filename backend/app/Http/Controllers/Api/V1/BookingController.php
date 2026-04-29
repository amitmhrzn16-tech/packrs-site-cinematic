<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\SlackNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /** Public endpoint — the website's Book a Pickup form posts here. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:32'],
            'address' => ['required', 'string', 'max:500'],
            'business_registered' => ['required', 'boolean'],
            'business_type' => ['nullable', 'string', 'max:80'],
            'avg_volume' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $booking = Booking::create([
            ...$data,
            'source' => 'website',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
        ]);

        // Best-effort Slack notify — never blocks or fails the response.
        try {
            SlackNotification::make()->notifyNewBooking($booking);
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'ok' => true,
            'message' => 'Pickup request received. We will call you shortly.',
            'booking_id' => $booking->id,
        ], 201);
    }
}
