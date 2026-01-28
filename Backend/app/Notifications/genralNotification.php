<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Twilio\Rest\Client;

class genralNotification extends Notification
{
    use Queueable;

    private $type;
    private $description;
    private $user_from;

    public function __construct($type, $description, $user_from)
    {
        $this->type = $type;
        $this->description = $description;
        $this->user_from = $user_from;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable)
    {
        $availableChannels = [
            'mail' => 'mail',
            'sms' => 'sms',
        ];

        return [$availableChannels[$this->type] ?? 'database'];
    }

    /**
     * To Mail
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Notification')
            ->greeting('Hello!')
            ->line('You have a new notification:')
            ->line($this->description)
            ->line('Thank you for using our application!');
    }

    /**
     * To Database
     */
    public function toDatabase($notifiable)
    {
        return [
            'user_from' => $this->user_from,
            'description' => $this->description,
            'type' => $this->type,
        ];
    }

    /**
     * To SMS
     */
    public function toSms($notifiable)
    {
        // Implement SMS sending logic here
        // Example using Twilio
        // $accountSid = env('TWILIO_ACCOUNT_SID');
        // $authToken = env('TWILIO_AUTH_TOKEN');
        // $twilioNumber = env('TWILIO_PHONE_NUMBER');

        // $client = new Client($accountSid, $authToken);
        // $client->messages->create(
        //     $notifiable->phone_number,
        //     [
        //         'from' => $twilioNumber,
        //         'body' => "You have a new notification: " . $this->description,
        //     ]
        // );

        return [
            'user_from' => $this->user_from,
            'description' => $this->description,
            'type' => $this->type,
        ];
    }
}
