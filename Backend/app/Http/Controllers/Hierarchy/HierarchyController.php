<?php

namespace App\Http\Controllers\Hierarchy;

use App\Http\Controllers\Utils\BaseController;
use App\Models\Department\Department;
use App\Models\User\User;
use App\Services\Eloquent\Hierarchy\HierarchyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * HierarchyController Class
 *
 * This controller is responsible for handling all Hierarchy-related actions, such as creating, reading, updating,
 * and deleting Hierarchy records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The HierarchyController relies on the HierarchyService to manage
 * Hierarchy-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class HierarchyController extends BaseController
{
    /**
     * The service instance for managing hierarchy-related business logic.
     *
     * @var HierarchyService
     */
    protected $hierarchyService;

    /**
     * Constructor for HierarchyController.
     *
     * Initializes the BaseController with the specific HierarchyService instance to ensure that
     * all Hierarchy-related operations are routed through the appropriate service layer.
     *
     * @param HierarchyService $service The service layer responsible for Hierarchy-specific business logic.
     */
    public function __construct(HierarchyService $service)
    {
        // Assign the service to the protected variable.
        $this->hierarchyService = $service;

        // Pass the HierarchyService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }

    /**
     * Handle AJAX request to get the structured hierarchy list.
     *
     * @return \Illuminate\Http\JsonResponse
     */



    public function dragAndDrop(Request $request)
    {
        // Call the service to process the drag-and-drop action
        $response = $this->hierarchyService->dragAndDrop($request);

        // Return the response as JSON
        return response()->json($response);
    }
}
