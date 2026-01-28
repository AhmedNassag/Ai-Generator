<?php

namespace App\Http\Controllers\Role;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Role\RoleService;
use Illuminate\Http\Request;
/**
 * RoleController Class
 *
 * This controller is responsible for handling all Role-related actions, such as creating, reading, updating,
 * and deleting Role records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The RoleController relies on the RoleService to manage
 * Role-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class RoleController extends BaseController
{
    /**
     * Constructor for RoleController.
     *
     * Initializes the BaseController with the specific RoleService instance to ensure that
     * all Role-related operations are routed through the appropriate service layer.
     *
     * @param RoleService $service The service layer responsible for Role-specific business logic.
     *
   */
    public function __construct(RoleService $service)
    {
        // Pass the RoleService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }

    public function getRoleJobWithDepartment($jobId, $departmentId)
    {
        try {
            // Retrieve the item by its ID using the service layer.
            $item = $this->baseService->getRoleJobWithDepartment($jobId, $departmentId);
            // Return a success response with the found item.
            return $this->ok($item);
        } catch (\Exception $e) {
            // If an error occurs, return a standardized error response.
            return $this->error([$e->getMessage()]);
        }
    }

    //save
    public function save(Request $request)
    {
        try {
            $item = $this->baseService->save($request);
            return $this->ok($item);
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }

    public function applyToAllDepartments(Request $request)
    {
        try {
            $item = $this->baseService->applyToAllDepartments($request);
            return $this->ok($item);
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }
}



