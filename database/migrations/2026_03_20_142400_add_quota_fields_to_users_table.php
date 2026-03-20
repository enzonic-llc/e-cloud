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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('server_limit')->nullable();
            $table->integer('cpu_quota')->nullable();
            $table->integer('ram_quota')->nullable();
            $table->integer('disk_quota')->nullable();
            $table->integer('port_quota')->nullable();
            $table->integer('backup_quota')->nullable();
            $table->integer('database_quota')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'server_limit',
                'cpu_quota',
                'ram_quota',
                'disk_quota',
                'port_quota',
                'backup_quota',
                'database_quota'
            ]);
        });
    }
};