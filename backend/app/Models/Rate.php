<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rate extends Model
{
    public const SERVICE_TYPES = ['inside_valley', 'branch_delivery', 'express_home', 'express_branch'];
    public const ADDITIONAL_MODES = ['flat', 'base_multiply', 'half_base'];

    protected $fillable = [
        'from_location', 'to_location', 'service_type',
        'base_rate', 'base_kg_limit',
        'additional_kg_mode', 'additional_kg_rate',
        'areas_covered', 'contact_number', 'active',
    ];

    protected function casts(): array
    {
        return [
            'areas_covered' => 'array',
            'active' => 'boolean',
            'base_rate' => 'float',
            'base_kg_limit' => 'float',
            'additional_kg_rate' => 'float',
        ];
    }

    /** Same arithmetic the CRM and the public-site calculator use. */
    public function calculate(float $weightKg): array
    {
        $w = max(0, $weightKg);
        $base = (float) $this->base_rate;
        $baseKg = (float) $this->base_kg_limit;
        $overflow = max(0, $w - $baseKg);
        $extraKg = $overflow > 0 ? (int) ceil($overflow) : 0;

        $perExtra = match ($this->additional_kg_mode) {
            'flat'          => (float) ($this->additional_kg_rate ?? 0),
            'base_multiply' => $base,
            'half_base'     => $base / 2,
            default         => 0.0,
        };

        $extra = $extraKg * $perExtra;

        return [
            'base_rate' => $base,
            'base_kg_limit' => $baseKg,
            'mode' => $this->additional_kg_mode,
            'per_extra_kg' => $perExtra,
            'extra_kg_units' => $extraKg,
            'extra_charge' => $extra,
            'total' => $base + $extra,
        ];
    }
}
