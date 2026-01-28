<?php

namespace App\Http\Controllers\Department;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Department\DepartmentService;
use Illuminate\Http\Request;
/**
 * DepartmentController Class
 *
 * This controller is responsible for handling all Department-related actions, such as creating, reading, updating,
 * and deleting Department records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The DepartmentController relies on the DepartmentService to manage
 * Department-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class DepartmentController extends BaseController
{
    /**
     * Constructor for DepartmentController.
     *
     * Initializes the BaseController with the specific DepartmentService instance to ensure that
     * all Department-related operations are routed through the appropriate service layer.
     *
     * @param DepartmentService $service The service layer responsible for Department-specific business logic.
     *
   */
    public function __construct(DepartmentService $service)
    {
        // Pass the DepartmentService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }
    // create department from csv files
    public function createWithCsvFiles(Request $request)
    {
        // Delegate the createWithCsvFiles operation to the DepartmentService.
        return $this->baseService->createWithCsvFiles($request);
    }
    public function departmentManagers($id)
    {
        return $this->baseService->departmentManagers($id);
    }
    public function getProfileSepartment($id)
    {
        try {
            $result = $this->baseService->getProfileSepartment($id);
            if($result){
                return $this->success($result);
            }
            return $this->error(["عفوا هناك خطأ ما "]);
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }

    public function assignLeader(Request $request)
    {
        try {
            $result = $this->baseService->assignLeader($request);
            if($result){
                return $this->success($result);
            }
            return $this->error(["عفوا هناك خطأ ما "]);
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }

    public function allDepartmentManagersIds()
    {
        return $this->baseService->allDepartmentManagersIds();
    }

    public function departmentEmployees($id)
    {
        return $this->baseService->departmentEmployees($id);
    }
}

