<?php

namespace App\Http\Controllers\Location;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Location\LocationService;
/**
 * LocationController Class
 *
 * This controller is responsible for handling all Location-related actions, such as creating, reading, updating,
 * and deleting Location records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The LocationController relies on the LocationService to manage
 * Location-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class LocationController extends BaseController
{
    /**
     * Constructor for LocationController.
     *
     * Initializes the BaseController with the specific LocationService instance to ensure that
     * all Location-related operations are routed through the appropriate service layer.
     *
     * @param LocationService $service The service layer responsible for Location-specific business logic.
     *
   */
    public function __construct(LocationService $service)
    {
        // Pass the LocationService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }
}



