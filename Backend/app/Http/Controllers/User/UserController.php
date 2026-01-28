<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Utils\BaseController;
use App\Models\Course\Course;
use App\Models\LmsLevel\LmsLevel;
use App\Models\LmsModule\LmsModule;
use App\Models\LmsUserAnswer\LmsUserAnswer;
use App\Models\Role\Role;
use App\Models\User\User;
use App\Services\Eloquent\User\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Log;

/**
 * UserController Class
 *
 * This controller is responsible for handling all user-related actions, such as creating, reading, updating,
 * and deleting user records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The UserController relies on the UserService to manage
 * user-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class UserController extends BaseController
{
    /**
     * Constructor for UserController.
     *
     * Initializes the BaseController with the specific UserService instance to ensure that
     * all user-related operations are routed through the appropriate service layer.
     *
     * @param UserService $service The service layer responsible for user-specific business logic,
     *                             such as user authentication, profile updates, and data retrieval.
     */
    public function __construct(UserService $service)
    {
        // Pass the UserService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }

    public function activeDeactive($id)
    {
        try {
            $result = $this->baseService->activeDeactive($id);
            if ($result) {
                return $this->success($result);
            }
            return $this->error(["عفوا هناك خطأ ما "]);
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }

    public function userInformation()
    {
        try {
             $user = $this->baseService->show(request()->user?->sub, request()->with ?? []);
         if ($user) {
                return $this->success($user);
            }
            return $this->error(["عفوا هناك خطأ ما"]);
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }

    public function unassignFromTeam(User $user, $teamId): JsonResponse
    {
        $result = $this->baseService->unassignFromTeam($user, $teamId);

        // dd($result);
        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
                'error' => $result['error'],
            ], 500);
        }

        return $this->success($result);
    }

    public function getUsersByFilters(Request $request)
    {
         $users = $this->baseService->getUsersByFilters($request);
         return $this->ok($users);
    }

     public function getFillable(string $modelName): JsonResponse
    {
        try {
            $fields = $this->baseService->getFillableFields($modelName);
            return response()->json($fields);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }
}
