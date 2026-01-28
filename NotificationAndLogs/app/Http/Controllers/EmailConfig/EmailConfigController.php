<?php

namespace App\Http\Controllers\EmailConfig;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\EmailConfig\EmailConfigService;
use Illuminate\Http\Request;

/**
 * EmailConfigController Class
 *
 * This controller is responsible for handling all EmailConfig-related actions, such as creating, reading, updating,
 * and deleting EmailConfig records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The EmailConfigController relies on the EmailConfigService to manage
 * EmailConfig-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class EmailConfigController extends BaseController
{
    /**
     * Constructor for EmailConfigController.
     *
     * Initializes the BaseController with the specific EmailConfigService instance to ensure that
     * all EmailConfig-related operations are routed through the appropriate service layer.
     *
     * @param EmailConfigService $service The service layer responsible for EmailConfig-specific business logic.
     *
     */
    public function __construct(EmailConfigService $service)
    {
        // Pass the EmailConfigService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }


    public function sendEmail(Request $request, EmailConfigService $service)
    {
        try {
            $response = $service->sendEmailService($request->all());

            if ($response === true) {
                return $this->ok('Connection Successful');
            }
            // If the response is not true, handle it as a failure case
            return $this->error('Connection Failed');
        } catch (\Exception $e) {
            // Pass the exception message as an array
            return $this->error([$e->getMessage()]);
        }
    }
}
