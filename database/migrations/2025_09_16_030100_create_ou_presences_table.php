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
        Schema::create('ou_presences', function (Blueprint $table) {
            $table->id();
            $table->uuid('external_id')->unique();
            $table->foreignId('ou_id')
                ->constrained('organizational_units')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('branch_ou_id')
                ->constrained('organizational_units')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->json('capabilities')->nullable();
            $table->timestamp('active_from')->nullable();
            $table->timestamp('active_to')->nullable();
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('ou_context_id')
                ->nullable()
                ->constrained('organizational_units')
                ->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['ou_id', 'branch_ou_id']);
            $table->index(['branch_ou_id', 'active_from']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ou_presences');
    }
};
