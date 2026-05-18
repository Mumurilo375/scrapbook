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
        Schema::create('asset_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->foreignUlid('asset_category_id')
                ->nullable()
                ->after('id')
                ->constrained('asset_categories')
                ->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0)->after('is_active');

            $table->index(['asset_category_id', 'is_active']);
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['asset_category_id']);
            $table->dropIndex(['asset_category_id', 'is_active']);
            $table->dropIndex(['is_active', 'sort_order']);
            $table->dropColumn(['asset_category_id', 'sort_order']);
        });

        Schema::dropIfExists('asset_categories');
    }
};
