<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\Eloquent\GeneralService;
use App\Http\Controllers\Utils\ResponseController;

class GeneralController extends ResponseController
{
    public function __construct(protected GeneralService $generalService){

    }

    public function logAndSendNotification(Request $request){
        try {
            \Log::info('GeneralController logAndSendNotification Request:', $request->all());
            $item =   $this->generalService->logAndSendNotification($request);
            return $this->success($item, 'push notification sent successfully');
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }

    public function sendNotificationAndEmail(Request $request)
    {
        try {
            $item = $this->generalService->sendNotificationAndEmail($request);
            return $this->success($item, 'push notification & email sent successfully');
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }
}
