<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rates', function (Blueprint $table) {
            $table->id();
            $table->string('from_location', 120)->default('Chabahil');
            $table->string('to_location', 120);
            $table->string('service_type', 32);                         // inside_valley | branch_delivery | express_home | express_branch
            $table->decimal('base_rate', 10, 2);
            $table->decimal('base_kg_limit', 8, 2)->default(1);
            $table->string('additional_kg_mode', 24)->default('flat');  // flat | base_multiply | half_base
            $table->decimal('additional_kg_rate', 10, 2)->nullable();
            $table->json('areas_covered')->nullable();
            $table->string('contact_number', 32)->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['from_location', 'to_location', 'service_type']);
            $table->index(['service_type', 'active']);
            $table->index('to_location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rates');
    }
};
