<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('phone', 32);
            $table->string('address', 500);
            $table->boolean('business_registered')->default(false);
            $table->string('business_type', 80)->nullable();
            $table->string('avg_volume', 80)->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 24)->default('new'); // new | contacted | converted | dropped
            $table->string('source', 40)->default('website');
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
