<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('page_slug', 80);              // e.g. 'home', 'about', 'services/same-day-delivery'
            $table->string('content_key', 80);            // e.g. 'hero_title', 'cta_button_text'
            $table->string('type', 16)->default('text');  // text | html | image | url
            $table->text('value')->nullable();
            $table->string('label', 200)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['page_slug', 'content_key']);
            $table->index('page_slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_contents');
    }
};
