<?php

namespace App\Http\Controllers\Color;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Color\ColorService;
/**
 * ColorController Class
 *
 * This controller is responsible for handling all Color-related actions, such as creating, reading, updating,
 * and deleting Color records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The ColorController relies on the ColorService to manage
 * Color-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class ColorController extends BaseController
{
    /**
     * Constructor for ColorController.
     *
     * Initializes the BaseController with the specific ColorService instance to ensure that
     * all Color-related operations are routed through the appropriate service layer.
     *
     * @param ColorService $service The service layer responsible for Color-specific business logic.
     *
   */
    public function __construct(ColorService $service)
    {
        // Pass the ColorService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }
}
