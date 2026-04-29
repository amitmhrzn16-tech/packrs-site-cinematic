<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('seo_settings', function (Blueprint $table) {
            $table->id();
            $table->string('page_slug', 80)->unique();
            $table->string('meta_title', 200)->nullable();
            $table->string('meta_description', 320)->nullable();
            $table->string('canonical_url', 300)->nullable();
            $table->string('og_title', 200)->nullable();
            $table->string('og_description', 320)->nullable();
            $table->string('og_image', 300)->nullable();
            $table->string('og_type', 32)->default('website');
            $table->string('twitter_card', 32)->default('summary_large_image');
            $table->json('keywords')->nullable();
            $table->boolean('robots_index')->default(true);
            $table->boolean('robots_follow')->default(true);
            $table->json('extra_meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_settings');
    }
};
