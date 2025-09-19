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
        Schema::create('curriculum_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('curriculum_id')->constrained('curricula')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('code')->nullable();
            $table->string('title');
            $table->enum('requirement_type', ['core', 'elective']);
            $table->unsignedSmallInteger('credit_value')->nullable();
            $table->json('rules')->nullable();
            $table->boolean('is_required')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum_requirements');
    }
};
