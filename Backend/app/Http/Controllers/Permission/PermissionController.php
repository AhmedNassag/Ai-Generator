<?php

namespace App\Http\Controllers\Permission;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Permission\PermissionService;
use Illuminate\Support\Facades\Route;
use ReflectionMethod;
use Illuminate\Routing\Route as LaravelRoute;
use App\Models\Permission\Permission;
use Illuminate\Http\Request;

/**
 * PermissionController Class
 *
 * This controller is responsible for handling all Permission-related actions, such as creating, reading, updating,
 * and deleting Permission records. It extends the BaseController to leverage generic CRUD functionality, ensuring
 * a consistent and maintainable code structure. The PermissionController relies on the PermissionService to manage
 * Permission-specific business logic and interactions with the data layer.
 *
 * By extending the BaseController, this class benefits from pre-defined methods for handling HTTP requests,
 * error handling, and standardized response formatting. This promotes reusability and reduces code duplication
 * across different controllers in the application.
 */
class PermissionController extends BaseController
{
    /**
     * Constructor for PermissionController.
     *
     * Initializes the BaseController with the specific PermissionService instance to ensure that
     * all Permission-related operations are routed through the appropriate service layer.
     *
     * @param PermissionService $service The service layer responsible for Permission-specific business logic.
     *
   */
    public function __construct(PermissionService $service)
    {
	$this->service = $service;
        // Pass the PermissionService instance to the parent constructor to initialize the base service.
        parent::__construct($service);
    }


    public function updatePermissions()
    {
        // Loop through all the routes in your application
        $routes = Route::getRoutes();
        $permissions = [];
        foreach ($routes as $route) {
            if ($route instanceof LaravelRoute) {
                // Get the controller and method for each route
                $action = $route->getAction();
                if (isset($action['controller'])) {
                    // Extract controller and method
                    $controllerAction = explode('@', $action['controller']);
                    $controller = str_replace('App\\Http\\Controllers\\', '', $controllerAction[0]);
                    $method = $controllerAction[1];

                    // Store or update the permission record
                    $permisions[] = $this->storeOrUpdatePermission($controller, $method);
                }
            }
        }
        return $this->ok($permissions);
    }

    public function store(Request $request)
    {

	$permissions = $this->service->createOrUpdate(
	   $request
	);


        return response()->json(['permissions' => $permissions], 200); // Return all created/updated permissions
    }

    // public function update($id, Request $request){

    // }

    public function destory($id){

    }

}



