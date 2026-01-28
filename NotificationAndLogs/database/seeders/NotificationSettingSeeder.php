<?php

namespace Database\Seeders;

use App\Models\NotificationSetting\NotificationSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class NotificationSettingSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = Http::get("http://82.29.175.67:9090/api/permission");
        $types = ['system', 'auto', 'email'];

        foreach ($allPermissions->json() as $permission) {
            foreach ($permission['controllers'] as $class => $actions) {
                foreach ($actions as $action) {
                    foreach ($types as $type) {
                        $notificationSettings = [
                            'type' => $type,
                            'class' => $class,
                            'action' => $action,
                            'status' => true,
                        ];
                        NotificationSetting::create($notificationSettings);
                    }
                }
            }
        }
    }
}
