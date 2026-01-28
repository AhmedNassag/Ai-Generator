<?php

namespace App\Http\Controllers\Translate;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Translate\TranslateService;
use Illuminate\Http\Request;

/**
 * TranslateController Class
 *
 * This controller is responsible for handling all Translate-related actions, such as creating, reading, updating,
 * and deleting Translate records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The TranslateController relies on the TranslateService to manage
 * Translate-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class TranslateController extends BaseController
{
    /**
     * Constructor for TranslateController.
     *
     * Initializes the BaseController with the specific TranslateService instance to ensure that
     * all Translate-related operations are routed through the appropriate service layer.
     *
     * @param TranslateService $service The service layer responsible for Translate-specific business logic.
     *
   */
    public function __construct(TranslateService $service)
    {
        // Pass the TranslateService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }
}

