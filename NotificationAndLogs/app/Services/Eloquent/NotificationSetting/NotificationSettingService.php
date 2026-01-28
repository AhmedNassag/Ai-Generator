<?php

namespace App\Services\Eloquent\NotificationSetting;

use App\Models\NotificationSetting\NotificationSetting;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\NotificationSetting\NotificationSettingRepository;
use App\Repositories\Eloquent\LogSetting\LogSettingRepository;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;


class NotificationSettingService extends BaseService
{
    protected $notificationSettingRepository;

    public function __construct()
    {
        parent::__construct(new NotificationSettingRepository());
        $this->notificationSettingRepository = app(NotificationSetting::class);
    }

    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            'type' => 'nullable|string|in:system,email,auto', // Must be one of: system, email, auto
            'action' => 'nullable', // Array of actions
            'status' => 'nullable', // True or false
            'message' => 'nullable|string', // String message
            'users' => 'nullable|array', // Array of user IDs
            'roles' => 'nullable|array', // Array of roles
            'data' => 'nullable', // Array
        ];
        $store = [...$validate];
        if ($type == 'store') {
            $request->validate($store);
        }
        if ($type == 'update') {
            $request->validate($validate);
        }
        if ($type == 'updateOrCreate') {
            $request->validate($validate);
        }
        return $request->all();
    }

    public function getFillableFields(string $modelName, array $excludeFields = []): array
    {
        // Convert model name to proper namespace
        $modelClass = 'App\\Models\\' . Str::studly($modelName) . '\\' . Str::studly($modelName);

        // Validate if the model class exists and is a valid model
        if (!class_exists($modelClass) || !is_subclass_of($modelClass, Model::class)) {
            throw new Exception('Model not found or invalid');
        }

        // Instantiate the model
        $model = new $modelClass();

        // Fetch fillable fields from the repository
        $fillableFields = $this->notificationSettingRepository->getFillable($model);

        // Filter out the excluded fields
        $filteredFields = array_diff($fillableFields, $excludeFields);

        // Format response
        return collect($filteredFields)->map(fn($field) => [
            'name' => $field,
        ])->toArray();
    }

    protected function validateDirectivesData(Request $request, $type = 'store')
    {
        // Validation rules
        $rules = [
            'directives' => 'required|array', // Ensure 'routes' is an array
            'directives.*.controllers' => 'required|array', // Validate 'controller' for each item
            'directives.*.name' => 'required|string|max:255', // Validate 'method' for each item
        ];
        // Validate the request data
        $validatedData = $request->validate($rules);

        return $validatedData;
    }

    public function createOrUpdate(Request $request)
    {
        $this->validateDirectivesData($request);
        $this->repository->delete(0);

        $directives = $request->input('directives');
        if (!is_array($directives)) {
            return response()->json(['error' => 'Invalid directives format'], 400);
        }

        $notificationSettings = [];
        $logSettings = [];
        foreach ($directives as $directive) {
            $controllers = $directive['controllers'] ?? null;
            $name = $directive['name'] ?? null;

            // Only proceed if 'name' exists and 'controllers' is an array
            if ($name && is_array($controllers)) {
                foreach ($controllers as $key => $actions) {
                    foreach ($actions as $action) {
                        $notificationSettings[] = [
                            "type" => "system",
                            "class" => $name,
                            "action" => $action,
                            "status" => false
                        ];
                        $notificationSettings[] = [
                            "type" => "auto",
                            "class" => $name,
                            "action" => $action,
                            "status" => false
                        ];
                        $notificationSettings[] = [
                            "type" => "email",
                            "class" => $name,
                            "action" => $action,
                            "status" => false
                        ];
                        $logSettings[] = [
                            "class" => $name,
                            "action" => $action,
                            "status" => "active"
                        ];
                    }
                }
            }
        }

        // Insert all notification settings at once
        if (!empty($notificationSettings)) {
            (new LogSettingRepository())->insert($logSettings);
            $this->repository->insert($notificationSettings);
        }

        return response()->json(['message' => 'Notification settings and log settings created successfully']);
    }
}
