<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\User\ProfileService;
use App\Services\Eloquent\User\UserService;
use Illuminate\Http\Request;

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
class ProfileController extends BaseController
{
    /**
     * Constructor for UserController.
     *
     * Initializes the BaseController with the specific UserService instance to ensure that
     * all user-related operations are routed through the appropriate service layer.
     *
     * @param ProfileService $service The service layer responsible for user-specific business logic,
     *                             such as user authentication, profile updates, and data retrieval.
     */
    public function __construct(ProfileService $service)
    {
        // Pass the UserService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }

    public function getProfile($id)
    {
        try {
            $result = $this->baseService->getProfile($id);
            if($result){
                return $this->success($result);
            }
            return $this->error(["عفوا هناك خطأ ما "]);
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }

    public function updatePssword(Request $request,$id)
    {
        try {
            $validate = [
                'old_password' => 'required',
                'password' => 'required|confirmed|min:8',
            ];
            $store = [...$validate];
            $request->validate($store);

            $result = $this->baseService->updatePssword($request->only('old_password','password'),$id);
            if($result){
                return $this->success($result);
            }else{
                return $this->error(["البيانات غير صحيحه"]);
            }
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }


}
