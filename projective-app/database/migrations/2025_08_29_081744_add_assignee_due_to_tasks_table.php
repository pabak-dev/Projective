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
 Schema::table('tasks', function (Blueprint $table) {
    if (!Schema::hasColumn('tasks', 'assignee_id')) {
        $table->foreignId('assignee_id')->nullable()->constrained('users')->onDelete('set null');
    }
    if (!Schema::hasColumn('tasks', 'due_date')) {
        $table->date('due_date')->nullable();
    }
});

}

public function down(): void
{
    Schema::table('tasks', function (Blueprint $table) {
        $table->dropForeign(['assignee_id']);
        $table->dropColumn(['assignee_id', 'due_date']);
    });
}

};
