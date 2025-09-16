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
        $rolesTable = config('permission.table_names.roles', 'roles');

        Schema::create('appointments', function (Blueprint $table) use ($rolesTable) {
            $table->id();
            $table->uuid('external_id')->unique();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('ou_id')
                ->constrained('organizational_units')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('role_id')
                ->constrained($rolesTable)
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->enum('scope_mode', ['self', 'subtree', 'global'])->default('self');
            $table->boolean('is_primary')->default(false);
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
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

            $table->index(['user_id', 'ou_id']);
            $table->index(['ou_id', 'role_id']);
            $table->index(['user_id', 'scope_mode']);
            $table->index('start_at');
            $table->index('end_at');
            $table->unique(['user_id', 'ou_id', 'role_id', 'scope_mode', 'start_at'], 'appointments_unique_slot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
