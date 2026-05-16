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
        Schema::create('occasions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('themes', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('preview_image_url')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('theme_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('theme_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->string('status')->default('draft');
            $table->jsonb('theme_tokens');
            $table->jsonb('settings')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->unique(['theme_id', 'version']);
            $table->index(['theme_id', 'status']);
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('theme_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('type');
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('extension', 16)->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_system')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'is_active']);
            $table->index(['theme_id', 'type']);
        });

        Schema::create('templates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('occasion_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('default_theme_id')->nullable()->constrained('themes')->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('cover_image_url')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->jsonb('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['occasion_id', 'is_active', 'sort_order']);
        });

        Schema::create('template_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('template_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('default_theme_version_id')->nullable()->constrained('theme_versions')->nullOnDelete();
            $table->unsignedInteger('version');
            $table->string('status')->default('draft');
            $table->jsonb('content_json')->nullable();
            $table->jsonb('settings')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->unique(['template_id', 'version']);
            $table->index(['template_id', 'status']);
        });

        Schema::create('template_pages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('template_version_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->nullable();
            $table->string('name');
            $table->string('page_type')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->jsonb('canvas_json');
            $table->jsonb('editable_slots')->nullable();
            $table->jsonb('interaction_config')->nullable();
            $table->jsonb('settings')->nullable();
            $table->boolean('is_required')->default(false);
            $table->boolean('is_repeatable')->default(true);
            $table->unsignedSmallInteger('min_instances')->nullable();
            $table->unsignedSmallInteger('max_instances')->nullable();
            $table->timestamps();

            $table->unique(['template_version_id', 'position']);
            $table->index(['template_version_id', 'page_type']);
        });

        Schema::create('plans', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('price_cents')->default(0);
            $table->char('currency', 3)->default('BRL');
            $table->unsignedInteger('duration_days')->nullable();
            $table->jsonb('limits_json')->nullable();
            $table->jsonb('features_json')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('gifts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('occasion_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('template_version_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('theme_version_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('draft');
            $table->string('slug')->unique();
            $table->string('public_token_hash', 64)->nullable()->unique();
            $table->string('title')->nullable();
            $table->string('recipient_name')->nullable();
            $table->string('sender_name')->nullable();
            $table->text('message')->nullable();
            $table->jsonb('settings')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('disabled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'expires_at']);
            $table->index('last_activity_at');
        });

        Schema::create('gift_pages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('gift_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('template_page_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->string('title')->nullable();
            $table->jsonb('canvas_json');
            $table->jsonb('content_json')->nullable();
            $table->jsonb('settings')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->unique(['gift_id', 'position']);
            $table->index(['gift_id', 'is_visible']);
        });

        Schema::create('media', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('gift_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignUlid('gift_page_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('image');
            $table->string('status')->default('pending');
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('original_path')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('extension', 16)->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('alt_text')->nullable();
            $table->jsonb('variants_json')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['gift_id', 'type']);
            $table->index(['user_id', 'status']);
            $table->index(['gift_page_id', 'type']);
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('gift_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('number')->unique();
            $table->string('status')->default('pending');
            $table->string('provider')->nullable();
            $table->string('provider_reference')->nullable();
            $table->char('currency', 3)->default('BRL');
            $table->unsignedInteger('subtotal_cents')->default(0);
            $table->unsignedInteger('discount_cents')->default(0);
            $table->unsignedInteger('total_cents')->default(0);
            $table->jsonb('price_snapshot')->nullable();
            $table->jsonb('limits_snapshot')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['gift_id', 'status']);
            $table->unique(['provider', 'provider_reference']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('order_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->string('provider');
            $table->string('provider_payment_id')->nullable();
            $table->string('method')->nullable();
            $table->char('currency', 3)->default('BRL');
            $table->unsignedInteger('amount_cents')->default(0);
            $table->jsonb('payload_json')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->unique(['provider', 'provider_payment_id']);
        });

        Schema::create('gift_visits', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('gift_id')->constrained()->cascadeOnDelete();
            $table->string('visitor_hash', 64)->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent_hash', 64)->nullable();
            $table->text('referrer')->nullable();
            $table->char('country', 2)->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['gift_id', 'created_at']);
            $table->index('visitor_hash');
        });

        Schema::create('gift_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('gift_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('gift_visit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('gift_page_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_type');
            $table->unsignedInteger('page_position')->nullable();
            $table->jsonb('payload_json')->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->timestamps();

            $table->index(['gift_id', 'event_type', 'occurred_at']);
            $table->index(['gift_visit_id', 'event_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gift_events');
        Schema::dropIfExists('gift_visits');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('media');
        Schema::dropIfExists('gift_pages');
        Schema::dropIfExists('gifts');
        Schema::dropIfExists('plans');
        Schema::dropIfExists('template_pages');
        Schema::dropIfExists('template_versions');
        Schema::dropIfExists('templates');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('theme_versions');
        Schema::dropIfExists('themes');
        Schema::dropIfExists('occasions');
    }
};
