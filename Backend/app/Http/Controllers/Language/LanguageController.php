<?php

namespace App\Http\Controllers\Language;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Language\LanguageService;
/**
 * LanguageController Class
 *
 * This controller is responsible for handling all Language-related actions, such as creating, reading, updating,
 * and deleting Language records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The LanguageController relies on the LanguageService to manage
 * Language-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class LanguageController extends BaseController
{
    /**
     * Constructor for LanguageController.
     *
     * Initializes the BaseController with the specific LanguageService instance to ensure that
     * all Language-related operations are routed through the appropriate service layer.
     *
     * @param LanguageService $service The service layer responsible for Language-specific business logic.
     *
   */
    public function __construct(LanguageService $service)
    {
        // Pass the LanguageService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }
}