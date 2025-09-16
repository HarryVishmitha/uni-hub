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
        Schema::create('config_overrides', function (Blueprint $table) {
            $table->id();
            $table->uuid('external_id')->unique();
            $table->foreignId('ou_id')
                ->constrained('organizational_units')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('key');
            $table->json('value')->nullable();
            $table->enum('inheritance', ['allow', 'block'])->default('allow');
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

            $table->unique(['ou_id', 'key']);
            $table->index('inheritance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('config_overrides');
    }
};
