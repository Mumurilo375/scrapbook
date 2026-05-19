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
        Schema::table('analytics_daily_metrics', function (Blueprint $table) {
            $table->string('dimensions_hash', 64)->nullable()->after('dimensions');
            $table->unique(['date', 'metric_key', 'dimensions_hash'], 'analytics_daily_metrics_unique_lookup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('analytics_daily_metrics', function (Blueprint $table) {
            $table->dropUnique('analytics_daily_metrics_unique_lookup');
            $table->dropColumn('dimensions_hash');
        });
    }
};
