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
        Schema::create('organizational_units', function (Blueprint $table) {
            $table->id();
            $table->uuid('external_id')->unique();
            $table->string('type');
            $table->string('name');
            $table->string('code')->unique();
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('organizational_units')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->string('status')->default('active');
            $table->json('metadata')->nullable();
            $table->string('path')->nullable()->index();
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
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizational_units');
    }
};
