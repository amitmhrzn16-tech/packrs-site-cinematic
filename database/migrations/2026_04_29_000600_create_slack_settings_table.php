<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('slack_settings', function (Blueprint $table) {
            $table->id();
            $table->string('webhook_url', 500)->nullable();
            $table->string('channel', 80)->nullable();          // override channel (#new-pickups), optional
            $table->string('username', 80)->default('Packrs Bot');
            $table->string('icon_emoji', 16)->default(':package:');
            $table->boolean('notify_bookings')->default(true);
            $table->boolean('notify_tracking_lookup')->default(false);
            $table->boolean('enabled')->default(false);
            $table->timestamp('last_sent_at')->nullable();
            $table->unsignedInteger('total_sent')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slack_settings');
    }
};
