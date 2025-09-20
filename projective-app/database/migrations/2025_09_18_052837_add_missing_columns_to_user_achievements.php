<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_achievements', function (Blueprint $table) {
            // Only add if column doesn't exist
            $columns = Schema::getColumnListing('user_achievements');
            
            if (!in_array('current_progress', $columns)) {
                $table->integer('current_progress')->default(0);
            }
            if (!in_array('target_progress', $columns)) {
                $table->integer('target_progress')->default(1);
            }
            if (!in_array('is_earned', $columns)) {
                $table->boolean('is_earned')->default(false);
            }
            if (!in_array('earned_at', $columns)) {
                $table->timestamp('earned_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_achievements', function (Blueprint $table) {
            $table->dropColumn(['current_progress', 'target_progress', 'is_earned', 'earned_at']);
        });
    }
};