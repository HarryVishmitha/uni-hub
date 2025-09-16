<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('departments')) {
            Schema::table('departments', function (Blueprint $table) {
                if (!Schema::hasColumn('departments', 'external_id')) {
                    $table->uuid('external_id')->nullable()->unique()->after('id');
                }

                if (!Schema::hasColumn('departments', 'ou_id')) {
                    $table->foreignId('ou_id')
                        ->nullable()
                        ->after('school_id')
                        ->constrained('organizational_units')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('departments', 'created_by')) {
                    $table->foreignId('created_by')
                        ->nullable()
                        ->after('updated_at')
                        ->constrained('users')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('departments', 'updated_by')) {
                    $table->foreignId('updated_by')
                        ->nullable()
                        ->after('created_by')
                        ->constrained('users')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('departments', 'ou_context_id')) {
                    $table->foreignId('ou_context_id')
                        ->nullable()
                        ->after('ou_id')
                        ->constrained('organizational_units')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('departments', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        if (Schema::hasTable('courses')) {
            Schema::table('courses', function (Blueprint $table) {
                if (!Schema::hasColumn('courses', 'external_id')) {
                    $table->uuid('external_id')->nullable()->unique()->after('id');
                }

                if (!Schema::hasColumn('courses', 'owner_ou_id')) {
                    $table->foreignId('owner_ou_id')
                        ->nullable()
                        ->after('department_id')
                        ->constrained('organizational_units')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('courses', 'delivery_ou_id')) {
                    $table->foreignId('delivery_ou_id')
                        ->nullable()
                        ->after('owner_ou_id')
                        ->constrained('organizational_units')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('courses', 'created_by')) {
                    $table->foreignId('created_by')
                        ->nullable()
                        ->after('updated_at')
                        ->constrained('users')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('courses', 'updated_by')) {
                    $table->foreignId('updated_by')
                        ->nullable()
                        ->after('created_by')
                        ->constrained('users')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('courses', 'ou_context_id')) {
                    $table->foreignId('ou_context_id')
                        ->nullable()
                        ->after('delivery_ou_id')
                        ->constrained('organizational_units')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('courses', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        if (Schema::hasTable('enrollments')) {
            Schema::table('enrollments', function (Blueprint $table) {
                if (!Schema::hasColumn('enrollments', 'external_id')) {
                    $table->uuid('external_id')->nullable()->unique()->after('id');
                }

                if (!Schema::hasColumn('enrollments', 'ou_id')) {
                    $table->foreignId('ou_id')
                        ->nullable()
                        ->after('course_id')
                        ->constrained('organizational_units')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('enrollments', 'created_by')) {
                    $table->foreignId('created_by')
                        ->nullable()
                        ->after('updated_at')
                        ->constrained('users')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('enrollments', 'updated_by')) {
                    $table->foreignId('updated_by')
                        ->nullable()
                        ->after('created_by')
                        ->constrained('users')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('enrollments', 'ou_context_id')) {
                    $table->foreignId('ou_context_id')
                        ->nullable()
                        ->after('ou_id')
                        ->constrained('organizational_units')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('enrollments', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('departments')) {
            Schema::table('departments', function (Blueprint $table) {
                if (Schema::hasColumn('departments', 'external_id')) {
                    $table->dropColumn('external_id');
                }
                if (Schema::hasColumn('departments', 'ou_id')) {
                    $table->dropConstrainedForeignId('ou_id');
                }
                if (Schema::hasColumn('departments', 'ou_context_id')) {
                    $table->dropConstrainedForeignId('ou_context_id');
                }
                if (Schema::hasColumn('departments', 'created_by')) {
                    $table->dropConstrainedForeignId('created_by');
                }
                if (Schema::hasColumn('departments', 'updated_by')) {
                    $table->dropConstrainedForeignId('updated_by');
                }
                if (Schema::hasColumn('departments', 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
            });
        }

        if (Schema::hasTable('courses')) {
            Schema::table('courses', function (Blueprint $table) {
                if (Schema::hasColumn('courses', 'external_id')) {
                    $table->dropColumn('external_id');
                }
                if (Schema::hasColumn('courses', 'owner_ou_id')) {
                    $table->dropConstrainedForeignId('owner_ou_id');
                }
                if (Schema::hasColumn('courses', 'delivery_ou_id')) {
                    $table->dropConstrainedForeignId('delivery_ou_id');
                }
                if (Schema::hasColumn('courses', 'ou_context_id')) {
                    $table->dropConstrainedForeignId('ou_context_id');
                }
                if (Schema::hasColumn('courses', 'created_by')) {
                    $table->dropConstrainedForeignId('created_by');
                }
                if (Schema::hasColumn('courses', 'updated_by')) {
                    $table->dropConstrainedForeignId('updated_by');
                }
                if (Schema::hasColumn('courses', 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
            });
        }

        if (Schema::hasTable('enrollments')) {
            Schema::table('enrollments', function (Blueprint $table) {
                if (Schema::hasColumn('enrollments', 'external_id')) {
                    $table->dropColumn('external_id');
                }
                if (Schema::hasColumn('enrollments', 'ou_id')) {
                    $table->dropConstrainedForeignId('ou_id');
                }
                if (Schema::hasColumn('enrollments', 'ou_context_id')) {
                    $table->dropConstrainedForeignId('ou_context_id');
                }
                if (Schema::hasColumn('enrollments', 'created_by')) {
                    $table->dropConstrainedForeignId('created_by');
                }
                if (Schema::hasColumn('enrollments', 'updated_by')) {
                    $table->dropConstrainedForeignId('updated_by');
                }
                if (Schema::hasColumn('enrollments', 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
            });
        }
    }
};
