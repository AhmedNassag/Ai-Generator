<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('notification.{userId}', function ($user, $userId) {
    //Only users with the given ID can listen
    return $user->id == $userId;
});

Broadcast::channel('role.{roleId}', function ($user, $roleId) {
    //Only users with the given role ID can listen
    return $user->role_id == $roleId;
});

Broadcast::channel('team.{teamId}', function ($user, $teamId) {
    //Only users who belong to the team can listen
   return in_array($teamId, $user->team_ids ?? []);
});


