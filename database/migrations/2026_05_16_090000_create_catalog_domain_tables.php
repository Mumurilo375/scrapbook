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
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('themes', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('theme_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('theme_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('status')->default('draft');
            $table->string('name');
            $table->jsonb('config');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['theme_id', 'version_number']);
            $table->index(['theme_id', 'status']);
            $table->index(['status', 'published_at']);
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->nullable()->unique();
            $table->string('type');
            $table->string('storage_disk')->default('public');
            $table->string('storage_path');
            $table->text('public_url')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });

        Schema::create('theme_asset', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('theme_version_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('asset_id')->constrained()->cascadeOnDelete();
            $table->string('role')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->jsonb('config')->nullable();
            $table->timestamps();

            $table->index(['theme_version_id', 'role', 'sort_order']);
            $table->unique(['theme_version_id', 'asset_id', 'role']);
        });

        Schema::create('templates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('occasion_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['occasion_id', 'is_active', 'sort_order']);
        });

        Schema::create('template_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('template_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('theme_version_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('status')->default('draft');
            $table->string('name');
            $table->jsonb('preview_config')->nullable();
            $table->jsonb('default_config')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['template_id', 'version_number']);
            $table->index(['template_id', 'status']);
            $table->index(['status', 'published_at']);
        });

        Schema::create('template_pages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('template_version_id')->constrained()->cascadeOnDelete();
            $table->string('page_type');
            $table->string('name');
            $table->unsignedInteger('sort_order')->default(0);
            $table->jsonb('canvas');
            $table->jsonb('editable_schema')->nullable();
            $table->jsonb('constraints')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->unique(['template_version_id', 'sort_order']);
            $table->index(['template_version_id', 'page_type']);
        });

        Schema::create('plans', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('price_cents');
            $table->char('currency', 3)->default('BRL');
            $table->unsignedInteger('max_pages')->nullable();
            $table->unsignedInteger('max_photos')->nullable();
            $table->unsignedInteger('max_storage_mb')->nullable();
            $table->unsignedInteger('gift_lifetime_days')->nullable();
            $table->boolean('can_use_qr_code')->default(false);
            $table->boolean('can_edit_after_publish')->default(false);
            $table->jsonb('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
        Schema::dropIfExists('template_pages');
        Schema::dropIfExists('template_versions');
        Schema::dropIfExists('templates');
        Schema::dropIfExists('theme_asset');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('theme_versions');
        Schema::dropIfExists('themes');
        Schema::dropIfExists('occasions');
    }
};
