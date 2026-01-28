<?php

namespace Database\Seeders;

use App\Models\LogSetting\LogSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class LogSettingSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = Http::get("http://82.29.175.67:9090/api/permission");

        foreach ($allPermissions->json() as $permission) {
            foreach ($permission['controllers'] as $class => $actions) {
                foreach ($actions as $action) {
                    $logSettings = [
                        'class' => $class,
                        'action' => $action,
                        'status' => "active",
                    ];
                    LogSetting::create($logSettings);
                }
            }
        }
    }
}
