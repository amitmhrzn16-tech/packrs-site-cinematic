<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ShipmentController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'parcels_delivered' => 30_000_000,
            'staff_current' => 50,
            'staff_target' => 1000,
            'locations' => 556,
            'districts' => 77,
            'sla_hours_min' => 4,
            'sla_hours_max' => 6,
            'narrative' => 'Carrying Happiness',
        ]);
    }

    public function track(string $trackingId): JsonResponse
    {
        $district = $this->resolveDistrict($trackingId);

        return response()->json([
            'tracking_id' => $trackingId,
            'status' => 'in_transit',
            'current_district' => $district['name'],
            'lat' => $district['lat'],
            'lng' => $district['lng'],
            'progress' => 0.62,
            'eta_minutes' => rand(15, 240),
            'history' => [
                ['at' => now()->subHours(5)->toIso8601String(), 'event' => 'Picked up at Hadigaun HQ'],
                ['at' => now()->subHours(3)->toIso8601String(), 'event' => 'Sorted at Kathmandu hub'],
                ['at' => now()->subHour()->toIso8601String(), 'event' => "En route to {$district['name']}"],
            ],
        ]);
    }

    public function districts(): JsonResponse
    {
        return response()->json(['districts' => $this->districtList()]);
    }

    public function ping(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tracking_id' => 'required|string',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        // broadcast(new RiderPing($data)); // wire to Reverb when configured
        return response()->json(['ok' => true, 'received' => $data]);
    }

    private function resolveDistrict(string $trackingId): array
    {
        $list = $this->districtList();
        $idx = abs(crc32($trackingId)) % count($list);
        return $list[$idx];
    }

    /** @return array<int,array{name:string,lat:float,lng:float}> */
    private function districtList(): array
    {
        return [
            ['name' => 'Kathmandu',   'lat' => 27.7172, 'lng' => 85.3240],
            ['name' => 'Lalitpur',    'lat' => 27.6588, 'lng' => 85.3247],
            ['name' => 'Bhaktapur',   'lat' => 27.6710, 'lng' => 85.4298],
            ['name' => 'Pokhara',     'lat' => 28.2096, 'lng' => 83.9856],
            ['name' => 'Chitwan',     'lat' => 27.5291, 'lng' => 84.3542],
            ['name' => 'Biratnagar',  'lat' => 26.4525, 'lng' => 87.2718],
            ['name' => 'Birgunj',     'lat' => 27.0104, 'lng' => 84.8770],
            ['name' => 'Butwal',      'lat' => 27.7000, 'lng' => 83.4486],
            ['name' => 'Dharan',      'lat' => 26.8147, 'lng' => 87.2769],
            ['name' => 'Janakpur',    'lat' => 26.7288, 'lng' => 85.9266],
            ['name' => 'Nepalgunj',   'lat' => 28.0500, 'lng' => 81.6167],
            ['name' => 'Hetauda',     'lat' => 27.4287, 'lng' => 85.0322],
            ['name' => 'Dhangadhi',   'lat' => 28.6833, 'lng' => 80.6000],
            ['name' => 'Itahari',     'lat' => 26.6650, 'lng' => 87.2718],
        ];
    }
}
