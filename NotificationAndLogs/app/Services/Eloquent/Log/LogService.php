<?php

namespace App\Services\Eloquent\Log;

use App\Models\Log\Log;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Log\LogRepository;
use App\Repositories\Eloquent\LogSetting\LogSettingRepository;
use Tymon\JWTAuth\Facades\JWTAuth;

class LogService extends BaseService
{
    protected $logSettingRepostory;

    public function __construct()
    {
        $this->logSettingRepostory = new LogSettingRepository();
        parent::__construct(new LogRepository());
    }

    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            'action' => 'required|string',
            'token' => [
                'required',
                'string',
                // 'regex:/^[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+$/'
            ],
            'service_name' => 'required|string',
            'class' => 'required|string',
            'data' => 'sometimes',
            'old_data' => 'sometimes',
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


    public function create(Request $request)
    {
        // Get user details
        $userData = $this->getUserDetails($request);
        // Add class and action to user data
        $class = $request->input('class');
        $action = $request->input('action');
        $userData['class'] = $class;
        $userData['action'] = $action;

        // Merge user data into the request
        $request->merge($userData);

        // Check log settings
        $logSettings = $this->logSettingRepostory->model
            ->where('class', $class)
            ->where('action', $action)
            ->latest()
            ->first();

        // If log settings are active, proceed with creation
        if ($logSettings && $logSettings->status == 'active') {
            return parent::create($request);
        }
    }

    protected function getUserDetails($request)
    {
        $userId = $request?->user?->sub;
        // Get the user's browser (from the user-agent)
        $browser = $request->browser;

        // Get the IP address of the user
        $ipAddress = $request->ip_address;

        $userOs = $request->operating_system;

        $token = $request->token;
        // $payload = JWTAuth::setToken($token)->getPayload();
        // $userId = $payload->get('sub'); // 'sub' is usually the user ID
        return [
            'ip_address' => $ipAddress,
            'operating_system' => $userOs,
            'browser' => $browser,
            'token' => $token,
            'user_id' => $userId
        ];
    }

    public function getModelLogs($modelName,$recordId)
    {
        return $this->repository->getModelLogs($modelName,$recordId);
    }


    public function getLogMultiModels($request)
    {

        return $this->repository->getLogMultiModels($request);
    }

}
