<?php

namespace App\Http\Controllers\NotificationSetting;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\NotificationSetting\NotificationSettingService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * NotificationSettingController Class
 *
 * This controller is responsible for handling all NotificationSetting-related actions, such as creating, reading, updating,
 * and deleting NotificationSetting records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The NotificationSettingController relies on the NotificationSettingService to manage
 * NotificationSetting-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class NotificationSettingController extends BaseController
{
    /**
     * Constructor for NotificationSettingController.
     *
     * Initializes the BaseController with the specific NotificationSettingService instance to ensure that
     * all NotificationSetting-related operations are routed through the appropriate service layer.
     *
     * @param NotificationSettingService $service The service layer responsible for NotificationSetting-specific business logic.
     *
   */
    public function __construct(NotificationSettingService $service)
    {
        // Pass the NotificationSettingService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }


    public function getFillable(string $modelName): JsonResponse
    {
        try {
            // Define the fields to exclude
            $excludeFields = [];

            // Call the service method with the exclude fields
            $fields = $this->baseService->getFillableFields($modelName, $excludeFields);
            return response()->json($fields);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request)
    {

        $notificationSettings = $this->baseService->createOrUpdate($request);

        return response()->json(['notificationSettings' => $notificationSettings], 200); // Return all created/updated permissions
    }

}


