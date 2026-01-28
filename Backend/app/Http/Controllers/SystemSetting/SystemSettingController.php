<?php

namespace App\Http\Controllers\SystemSetting;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\SystemSetting\SystemSettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SystemSettingController extends BaseController
{
    protected $service;

    public function __construct(SystemSettingService $service)
    {
        parent::__construct($service);
        $this->service = $service;
    }



    public function saveCompleteConfiguration(Request $request)
    {
        try {
            $result = $this->service->saveCompleteConfiguration($request);
            return $this->success($result, 'Record updated successfully');
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }
}
