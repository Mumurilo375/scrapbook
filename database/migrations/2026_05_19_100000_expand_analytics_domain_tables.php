<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('analytics_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->text('entry_path')->nullable();
            $table->text('current_path')->nullable();
            $table->text('referrer')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('device_type')->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->string('locale')->nullable();
            $table->string('timezone')->nullable();
            $table->string('screen_size_bucket')->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent_hash', 64)->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'last_seen_at']);
            $table->index('first_seen_at');
            $table->index('last_seen_at');
            $table->index(['utm_source', 'utm_campaign']);
        });

        Schema::create('analytics_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('event_uuid')->nullable()->unique();
            $table->foreignId('session_id')->nullable()->constrained('analytics_sessions')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('gift_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('template_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('template_version_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('theme_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('theme_version_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('occasion_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_name');
            $table->string('event_group');
            $table->timestamp('occurred_at')->useCurrent();
            $table->string('source')->default('server');
            $table->text('path')->nullable();
            $table->text('referrer')->nullable();
            $table->jsonb('payload')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index('event_name');
            $table->index('event_group');
            $table->index('occurred_at');
            $table->index(['session_id', 'occurred_at']);
            $table->index(['user_id', 'occurred_at']);
            $table->index(['gift_id', 'occurred_at']);
            $table->index(['order_id', 'occurred_at']);
            $table->index(['payment_id', 'occurred_at']);
            $table->index(['template_version_id', 'occurred_at']);
            $table->index(['theme_version_id', 'occurred_at']);
            $table->index(['occasion_id', 'occurred_at']);
        });

        Schema::table('gift_visits', function (Blueprint $table) {
            $table->uuid('visit_uuid')->nullable()->unique()->after('id');
            $table->foreignId('analytics_session_id')->nullable()->after('gift_id')->constrained('analytics_sessions')->nullOnDelete();
            $table->string('public_source')->nullable()->after('analytics_session_id');
            $table->timestamp('completed_at')->nullable()->after('opened_at');
            $table->unsignedInteger('page_views_count')->default(0)->after('completed_at');
            $table->unsignedInteger('interactions_count')->default(0)->after('page_views_count');
            $table->string('device_type')->nullable()->after('user_agent_hash');
            $table->string('browser')->nullable()->after('device_type');
            $table->string('os')->nullable()->after('browser');

            $table->index(['analytics_session_id', 'opened_at']);
            $table->index(['gift_id', 'public_source', 'opened_at']);
            $table->index('completed_at');
        });

        DB::table('gift_visits')
            ->whereNull('visit_uuid')
            ->orderBy('id')
            ->lazyById()
            ->each(function (object $visit): void {
                DB::table('gift_visits')
                    ->where('id', $visit->id)
                    ->update(['visit_uuid' => (string) Str::uuid()]);
            });

        Schema::table('gift_events', function (Blueprint $table) {
            $table->foreignUlid('gift_visit_id')->nullable()->after('gift_id')->constrained('gift_visits')->nullOnDelete();
            $table->foreignId('analytics_session_id')->nullable()->after('gift_visit_id')->constrained('analytics_sessions')->nullOnDelete();
            $table->string('event_name')->nullable()->after('user_id');
            $table->unsignedInteger('page_index')->nullable()->after('occurred_at');
            $table->string('page_id')->nullable()->after('page_index');
            $table->string('element_id')->nullable()->after('page_id');
            $table->string('element_type')->nullable()->after('element_id');
            $table->jsonb('metadata')->nullable()->after('payload');

            $table->index(['gift_visit_id', 'event_name', 'occurred_at']);
            $table->index(['analytics_session_id', 'event_name', 'occurred_at']);
            $table->index(['gift_id', 'event_name', 'occurred_at']);
            $table->index(['event_name', 'occurred_at']);
            $table->index(['page_id', 'event_name']);
            $table->index(['element_type', 'event_name']);
        });

        DB::table('gift_events')
            ->whereNull('event_name')
            ->update(['event_name' => DB::raw('event_type')]);

        Schema::create('analytics_daily_metrics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('metric_key');
            $table->jsonb('dimensions')->nullable();
            $table->decimal('value_numeric', 16, 2)->default(0);
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['date', 'metric_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_daily_metrics');

        Schema::table('gift_events', function (Blueprint $table) {
            $table->dropIndex(['gift_visit_id', 'event_name', 'occurred_at']);
            $table->dropIndex(['analytics_session_id', 'event_name', 'occurred_at']);
            $table->dropIndex(['gift_id', 'event_name', 'occurred_at']);
            $table->dropIndex(['event_name', 'occurred_at']);
            $table->dropIndex(['page_id', 'event_name']);
            $table->dropIndex(['element_type', 'event_name']);
            $table->dropConstrainedForeignId('analytics_session_id');
            $table->dropConstrainedForeignId('gift_visit_id');
            $table->dropColumn([
                'event_name',
                'page_index',
                'page_id',
                'element_id',
                'element_type',
                'metadata',
            ]);
        });

        Schema::table('gift_visits', function (Blueprint $table) {
            $table->dropIndex(['analytics_session_id', 'opened_at']);
            $table->dropIndex(['gift_id', 'public_source', 'opened_at']);
            $table->dropIndex(['completed_at']);
            $table->dropConstrainedForeignId('analytics_session_id');
            $table->dropColumn([
                'visit_uuid',
                'public_source',
                'completed_at',
                'page_views_count',
                'interactions_count',
                'device_type',
                'browser',
                'os',
            ]);
        });

        Schema::dropIfExists('analytics_events');
        Schema::dropIfExists('analytics_sessions');
    }
};
