<?php

namespace App\Services\Eloquent\LogSetting;

use App\Models\LogSetting\LogSetting;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\LogSetting\LogSettingRepository;

class LogSettingService extends BaseService
{

    public function __construct()
    {
        parent::__construct(new LogSettingRepository());
    }

    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            'action' => 'required|string',
            'class' => 'required|string',
            'status' => 'nullable|in:active,inactive',
        ];

        $store = [...$validate];

        if ($type == 'store') {
            $request->validate($store);
        }
        if ($type == 'update') {
            $request->validate($validate);
        }
        return $request->all();
    }
}
