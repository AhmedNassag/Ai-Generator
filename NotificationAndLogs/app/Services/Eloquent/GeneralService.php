<?php
namespace App\Services\Eloquent;

use App\Services\Eloquent\EmailConfig\EmailConfigService;
use Illuminate\Http\Request;
use App\Services\Eloquent\Notification\NotificationService;
use App\Services\Eloquent\Log\LogService;
class GeneralService
{
    public function __construct(protected NotificationService $notificationService, protected EmailConfigService $emailService, protected LogService $logService)
    {

    }

    public function logAndSendNotification(Request $request)
    {
        \Log::info('GeneralService logAndSendNotification Request:', $request->all());
        // save log
        $log = $this->logService->create($request);

        $emailConfig = $request->input('email_config');

        if (!empty($emailConfig) && is_array($emailConfig)) {

            $this->notificationService->sendEmailNotification($emailConfig['email'], $emailConfig['body'], $emailConfig['subject'] ?? "No Subject");
        }
        // notification thre type of notification email , system  and auto
        $notifiy = $this->notificationService->getNotificationType($request);

        $log = empty($log) || (is_array($log) && count($log) == 0) ? false : true;

        $notifiy = empty($notifiy) || (is_array($notifiy) && count($notifiy) == 0) ? false : true;

        // return ['log' => $log, 'notify' => $notifiy];
    }

    public function sendNotificationAndEmail(Request $request)
    {
        $data = $request->all();

        // Extract emails from users array
        $emails = array_map(function ($user) {
            return $user['email'];
        }, $data['data']['users'] ?? []);

        // If channel is notification or both, send notifications
        if ($data['data']['channel'] == 'notification' || $data['data']['channel'] == 'both') {
            $data['data']['type'] = 'system';
            $data['data']['action'] = $data['action'];
            $data['data']['class'] = $data['class'];
            $data['data']['classId'] = $data['data']['id'];
            $data['data']['roles'] = [];

            // Don't overwrite teams_ids with empty array, use the existing teams_ids
            $data['data']['teams'] = $data['data']['teams_ids'] ?? []; // Use teams_ids instead of empty array

            // Extract just the user IDs from the users array
            $data['data']['users'] = array_map(function ($user) {
                return $user['id'];
            }, $data['data']['users'] ?? []);

            $this->notificationService->sendSystemNotification($data['data'], $data['data']['content']);
        }

        // If channel is email or both, send emails
        if ($data['data']['channel'] == 'email' || $data['data']['channel'] == 'both') {
            foreach ($emails as $email) {
                $this->emailService->sendEmailService([
                    'email' => $email,
                    'body' => $data['data']['content'],
                    'subject' => $data['data']['title'] ?? 'No Subject'
                ]);
            }
        }

        return $data;
    }
}
