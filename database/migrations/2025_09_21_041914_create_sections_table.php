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
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnUpdate();
            $table->foreignId('term_id')->constrained()->cascadeOnUpdate();
            $table->string('section_code', 32);
            $table->unsignedSmallInteger('capacity');
            $table->unsignedSmallInteger('waitlist_cap')->default(0);
            $table->enum('status', ['planned', 'active', 'closed', 'cancelled'])->default('planned');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['course_id', 'term_id', 'section_code']);
            $table->index(['term_id', 'course_id', 'section_code']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
