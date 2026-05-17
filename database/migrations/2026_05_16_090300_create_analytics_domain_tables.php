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
        Schema::create('gift_visits', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('gift_id')->constrained()->cascadeOnDelete();
            $table->string('session_hash', 64)->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent_hash', 64)->nullable();
            $table->text('referrer')->nullable();
            $table->timestamp('opened_at')->useCurrent();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['gift_id', 'opened_at']);
            $table->index('session_hash');
        });

        Schema::create('gift_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('gift_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_type');
            $table->jsonb('payload')->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->timestamps();

            $table->index(['gift_id', 'event_type', 'occurred_at']);
            $table->index(['user_id', 'event_type', 'occurred_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gift_events');
        Schema::dropIfExists('gift_visits');
    }
};
