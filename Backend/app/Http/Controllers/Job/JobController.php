<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Utils\BaseController;
use App\Models\User\User;
use App\Services\Eloquent\Job\JobService;
/**
 * JobController Class
 *
 * This controller is responsible for handling all Job-related actions, such as creating, reading, updating,
 * and deleting Job records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The JobController relies on the JobService to manage
 * Job-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class JobController extends BaseController
{
    /**
     * Constructor for JobController.
     *
     * Initializes the BaseController with the specific JobService instance to ensure that
     * all Job-related operations are routed through the appropriate service layer.
     *
     * @param JobService $service The service layer responsible for Job-specific business logic.
     *
     */

    protected $service;
    public function __construct(JobService $service)
    {
        // Pass the JobService instance to the parent constructor to initialize the base service.
        $this->service = $service;
        parent::__construct($service);
    }


    public function destroy($id)
    {
        try {
            // Check if the request contains `forceDelete=true`.
            $forceDelete = request()->input('forceDelete', false);

            if ($forceDelete) {
                // Call the service layer to force delete the record.
                $this->baseService->forceDelete($id);
                return $this->success(null, 'Record force deleted successfully');
            }

            // Call the service layer to soft delete the record.
            $delete = $this->service->delete($id);

            if ($delete == false) {
                return response()->json(['message' => 'This job cannot be deleted as it is currently associated with one or more dependencies.'], 422);

            }
            return $this->success(null, 'Record deleted successfully');
        } catch (\Exception $e) {
            // Return an error response if the deletion fails.
            return $this->error([$e->getMessage()]);
        }
    }



}

