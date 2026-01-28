<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Team\TeamService;
/**
 * TeamController Class
 *
 * This controller is responsible for handling all Team-related actions, such as creating, reading, updating,
 * and deleting Team records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The TeamController relies on the TeamService to manage
 * Team-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class TeamController extends BaseController
{
    /**
     * Constructor for TeamController.
     *
     * Initializes the BaseController with the specific TeamService instance to ensure that
     * all Team-related operations are routed through the appropriate service layer.
     *
     * @param TeamService $service The service layer responsible for Team-specific business logic.
     *
     */
    protected $TeamService;


    public function __construct(TeamService $TeamService)
    {
        $this->TeamService = $TeamService;
        parent::__construct($TeamService);
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
            $delete = $this->TeamService->delete($id);

            if ($delete == false) {
                return response()->json(['message' => 'The team is assigned to a user and cannot be deleted.'], 422);

            }
            return $this->success(null, 'Record deleted successfully');
        } catch (\Exception $e) {
            // Return an error response if the deletion fails.
            return $this->error([$e->getMessage()]);
        }
    }
}



