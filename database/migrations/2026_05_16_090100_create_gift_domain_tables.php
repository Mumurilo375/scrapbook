<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gifts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('occasion_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('template_version_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('theme_version_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->nullable();
            $table->string('public_code', 64)->nullable()->unique();
            $table->string('status')->default('draft');
            $table->string('visibility')->default('private');
            $table->string('recipient_name')->nullable();
            $table->string('sender_name')->nullable();
            $table->ulid('cover_media_id')->nullable()->index();
            $table->jsonb('settings')->nullable();
            $table->jsonb('limits_snapshot')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_edited_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'visibility']);
            $table->index(['slug', 'public_code']);
            $table->index(['expires_at', 'status']);
        });

        Schema::create('gift_pages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('gift_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('source_template_page_id')->nullable()->constrained('template_pages')->nullOnDelete();
            $table->string('page_type');
            $table->string('name');
            $table->unsignedInteger('sort_order')->default(0);
            $table->jsonb('canvas');
            $table->jsonb('settings')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->boolean('locked')->default(false);
            $table->timestamps();

            $table->unique(['gift_id', 'sort_order']);
            $table->index(['gift_id', 'is_visible', 'sort_order']);
        });

        Schema::create('media_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('gift_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type')->default('image');
            $table->string('original_filename')->nullable();
            $table->string('storage_disk')->default('public');
            $table->string('storage_path');
            $table->string('mime_type');
            $table->unsignedBigInteger('size_bytes');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->jsonb('variants')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['gift_id', 'type']);
            $table->index(['status', 'type']);
        });

        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            Schema::table('gifts', function (Blueprint $table) {
                $table->foreign('cover_media_id')->references('id')->on('media_items')->nullOnDelete();
            });
        }

        Schema::create('music_selections', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('gift_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('provider')->nullable();
            $table->string('provider_track_id')->nullable();
            $table->string('title');
            $table->string('artist')->nullable();
            $table->string('album')->nullable();
            $table->text('artwork_url')->nullable();
            $table->text('external_url')->nullable();
            $table->text('preview_url')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['provider', 'provider_track_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('music_selections');

        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            Schema::table('gifts', function (Blueprint $table) {
                $table->dropForeign(['cover_media_id']);
            });
        }

        Schema::dropIfExists('media_items');
        Schema::dropIfExists('gift_pages');
        Schema::dropIfExists('gifts');
    }
};
