<?php

namespace App\Http\Controllers\Log;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Log\LogService;
use Illuminate\Http\Request;

/**
 * LogController Class
 *
 * This controller is responsible for handling all Log-related actions, such as creating, reading, updating,
 * and deleting Log records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The LogController relies on the LogService to manage
 * Log-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class LogController extends BaseController
{
    /**
     * Constructor for LogController.
     *
     * Initializes the BaseController with the specific LogService instance to ensure that
     * all Log-related operations are routed through the appropriate service layer.
     *
     * @param LogService $service The service layer responsible for Log-specific business logic.
     *
     */
    protected $logService;


    public function __construct(LogService $service)
    {
        // Pass the LogService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
        $this->logService = $service;
    }


    public function getModelLogs($modelName,$recordId)
    {
        try {

            $item =  $this->logService->getModelLogs($modelName,$recordId);

            return $this->ok($item);
        } catch (\Exception $e) {
            // If an error occurs, return a standardized error response.
            return $this->error([$e->getMessage()]);
        }
    }

    //getLogMultiModels
    public function getLogMultiModels(Request $request)
    {
        try {
            $item =  $this->logService->getLogMultiModels($request);

            return $this->ok($item);
        } catch (\Exception $e) {
            // If an error occurs, return a standardized error response.
            return $this->error([$e->getMessage()]);
        }
    }




}
