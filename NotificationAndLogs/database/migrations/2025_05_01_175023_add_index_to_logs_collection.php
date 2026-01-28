<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::connection('mongodb')
            ->getCollection('logs')
            ->createIndex(['class' => 1], ['unique' => false]);
    }

    public function down(): void
    {
        // You can drop by index name or key — dropping by name is safer
        DB::connection('mongodb')
            ->getCollection('logs')
            ->dropIndex(['class' => 1]);
    }
};
