<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class Alert implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;
    protected $channelType;
    protected $channelId;

    public function __construct(string $channelType, $channelId, $notification)
    {
        $this->channelType = $channelType; // 'notification', 'role', or 'team'
        $this->channelId = $channelId;     //teamId or roleId , or userId
        $this->notification = $notification;               //notification data
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("{$this->channelType}.{$this->channelId}");
    }

    public function broadcastWith(): array
    {
        return ['notification' => $this->notification];
    }

    public function broadcastAs(): string
    {
        return 'Alert';
    }
}
