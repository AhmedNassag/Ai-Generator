<?php

namespace App\Http\Controllers\Position;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Position\PositionService;
/**
 * PositionController Class
 *
 * This controller is responsible for handling all Position-related actions, such as creating, reading, updating,
 * and deleting Position records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The PositionController relies on the PositionService to manage
 * Position-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class PositionController extends BaseController
{
    /**
     * Constructor for PositionController.
     *
     * Initializes the BaseController with the specific PositionService instance to ensure that
     * all Position-related operations are routed through the appropriate service layer.
     *
     * @param PositionService $service The service layer responsible for Position-specific business logic.
     *
   */
    public function __construct(PositionService $service)
    {
        // Pass the PositionService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }
}



