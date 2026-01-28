<?php

namespace App\Traits;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Jenssegers\Agent\Agent;

trait SendNotificationDataTrait
{
    /**
     * Sends data to notificationAndLog service.
     *
     * @param string $class //example => User
     * @param string $action //example => create
     * @param string $token
     * @param array $data
     * @return void
     */
     public function sendDataToPushNotification($class,$action, $token ,$data=null,$old_data=null, $email_config=null)
    {
        $agent = new Agent();
        $agent->setUserAgent(request()->userAgent());
        $browser = $agent->browser();
        $browserVersion = $agent->version($browser);
        $platform = $agent->platform();
        try {
            $payload = [
                'class' => $class,
                'action' => $action,
                'service_name' =>"GRC Core Service",
                'token' => $token,
                'data' => $data ?? [],
                'old_data'=>$old_data ?? "",
                'email_config' => $email_config ?? [],
                'ip_address' => request()->ip(),
                'operating_system' => $platform ?? '',
                'browser' => $browser ?? '',
            ];
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $token,
            ])->post(env('NOTIFICATION_SERVICE').'/send/log/notification', $payload); //this request sent to notification service
            Log::info($response);

        } catch (\Exception $e) {
            Log::error('Notification failed', ['error' => $e->getMessage()]);
        }
    }
}
