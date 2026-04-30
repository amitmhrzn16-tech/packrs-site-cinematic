<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RatesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Rate::query()->orderBy('to_location')->orderBy('service_type');
        if ($svc = $request->query('service_type')) $q->where('service_type', $svc);
        if ($search = $request->query('q')) $q->where('to_location', 'like', "%{$search}%");
        return response()->json(['data' => $q->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $rate = Rate::create($data);
        return response()->json(['data' => $rate], 201);
    }

    public function update(Request $request, Rate $rate): JsonResponse
    {
        $data = $this->validatePayload($request, partial: true);
        $rate->update($data);
        return response()->json(['data' => $rate->fresh()]);
    }

    public function destroy(Rate $rate): JsonResponse
    {
        $rate->delete();
        return response()->json(['ok' => true]);
    }

    /**
     * CSV upload — header row drives the column mapping. Required headers:
     *   to_location, service_type, base_rate, base_kg_limit, additional_kg_mode
     * Optional headers:
     *   additional_kg_rate, contact_number, areas_covered, from_location, active
     *
     * Mode:
     *   upsert  (default) — update by (from_location + to_location + service_type), insert new
     *   append             — always insert
     *   replace            — wipe table, then insert
     */
    public function bulkUpload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:text/csv,text/plain,application/csv,application/vnd.ms-excel', 'max:10240'],
            'mode' => ['nullable', Rule::in(['upsert', 'append', 'replace'])],
        ]);

        $mode = $request->input('mode', 'upsert');

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        if (!$handle) return response()->json(['message' => 'Could not read the file.'], 422);

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return response()->json(['message' => 'CSV is empty.'], 422);
        }
        $header = array_map(fn ($h) => strtolower(trim((string) $h)), $header);

        $required = ['to_location', 'service_type', 'base_rate', 'base_kg_limit', 'additional_kg_mode'];
        foreach ($required as $col) {
            if (!in_array($col, $header, true)) {
                fclose($handle);
                return response()->json([
                    'message' => "Missing required column '{$col}'. Expected: " . implode(', ', $required) .
                                 ' (optional: additional_kg_rate, contact_number, areas_covered, from_location, active)',
                ], 422);
            }
        }

        if ($mode === 'replace') Rate::query()->delete();

        $created = 0; $updated = 0; $skipped = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;
            if (collect($row)->filter(fn ($v) => $v !== null && $v !== '')->isEmpty()) continue;

            $assoc = array_combine($header, array_pad($row, count($header), null));

            $payload = [
                'from_location'      => trim((string) ($assoc['from_location'] ?? 'Chabahil')) ?: 'Chabahil',
                'to_location'        => trim((string) ($assoc['to_location'] ?? '')),
                'service_type'       => strtolower(trim((string) ($assoc['service_type'] ?? ''))),
                'base_rate'          => is_numeric($assoc['base_rate'] ?? null) ? (float) $assoc['base_rate'] : null,
                'base_kg_limit'      => is_numeric($assoc['base_kg_limit'] ?? null) ? (float) $assoc['base_kg_limit'] : null,
                'additional_kg_mode' => strtolower(trim((string) ($assoc['additional_kg_mode'] ?? 'flat'))),
                'additional_kg_rate' => is_numeric($assoc['additional_kg_rate'] ?? null) ? (float) $assoc['additional_kg_rate'] : null,
                'areas_covered'      => $this->parseAreas($assoc['areas_covered'] ?? null),
                'contact_number'     => $this->normalizePhone($assoc['contact_number'] ?? null),
                'active'             => $this->parseBool($assoc['active'] ?? true),
            ];

            $validator = Validator::make($payload, [
                'to_location'        => ['required', 'string', 'max:120'],
                'service_type'       => ['required', Rule::in(Rate::SERVICE_TYPES)],
                'base_rate'          => ['required', 'numeric', 'min:0'],
                'base_kg_limit'      => ['required', 'numeric', 'min:0'],
                'additional_kg_mode' => ['required', Rule::in(Rate::ADDITIONAL_MODES)],
                'additional_kg_rate' => ['nullable', 'numeric', 'min:0'],
                'contact_number'     => ['nullable', 'string', 'max:50'],
            ]);

            if ($validator->fails()) {
                $skipped[] = ['row' => $line, 'errors' => $validator->errors()->all()];
                continue;
            }

            if ($mode === 'append') {
                Rate::create($payload);
                $created++;
                continue;
            }

            $existing = Rate::where('to_location', $payload['to_location'])
                ->where('service_type', $payload['service_type'])
                ->where('from_location', $payload['from_location'])
                ->first();

            if ($existing) {
                $existing->update($payload);
                $updated++;
            } else {
                Rate::create($payload);
                $created++;
            }
        }

        fclose($handle);

        return response()->json([
            'message' => "Imported {$created} new, updated {$updated}, skipped " . count($skipped) . '.',
            'data' => ['mode' => $mode, 'created' => $created, 'updated' => $updated, 'skipped' => $skipped],
        ]);
    }

    private function parseAreas($v): array
    {
        if (is_array($v)) return array_values(array_filter(array_map('trim', $v)));
        if ($v === null || $v === '') return [];
        return array_values(array_filter(array_map('trim', preg_split('/[;,|]+/', (string) $v))));
    }

    private function normalizePhone($v): ?string
    {
        if ($v === null || $v === '') return null;
        $s = trim((string) $v);
        // Excel scientific notation like 9.701003362E9 → 9701003362
        if (is_numeric($s) && (float) $s >= 1e9) return (string) (int) (float) $s;
        return $s;
    }

    private function parseBool($v): bool
    {
        if (is_bool($v)) return $v;
        if (is_numeric($v)) return (int) $v !== 0;
        return in_array(strtolower(trim((string) $v)), ['1', 'true', 'yes', 'y', 'active'], true);
    }

    private function validatePayload(Request $r, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $r->validate([
            'from_location'      => ['sometimes', 'string', 'max:120'],
            'to_location'        => [$required, 'string', 'max:120'],
            'service_type'       => [$required, Rule::in(Rate::SERVICE_TYPES)],
            'base_rate'          => [$required, 'numeric', 'min:0'],
            'base_kg_limit'      => [$required, 'numeric', 'min:0'],
            'additional_kg_mode' => [$required, Rule::in(Rate::ADDITIONAL_MODES)],
            'additional_kg_rate' => ['nullable', 'numeric', 'min:0'],
            'areas_covered'      => ['nullable', 'array'],
            'areas_covered.*'    => ['string', 'max:120'],
            'contact_number'     => ['nullable', 'string', 'max:50'],
            'active'             => ['sometimes', 'boolean'],
        ]);
    }
}
