<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('eggs', function (Blueprint $table) {
            $table->boolean('is_deployable')->default(false);
            $table->string('deploy_name')->nullable();
            $table->boolean('is_minecraft')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('eggs', function (Blueprint $table) {
            $table->dropColumn([
                'is_deployable',
                'deploy_name',
                'is_minecraft'
            ]);
        });
    }
};