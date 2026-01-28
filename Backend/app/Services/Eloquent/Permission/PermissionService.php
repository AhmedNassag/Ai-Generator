<?php

namespace App\Services\Eloquent\Permission;

use App\Models\Permission\Permission;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Permission\PermissionRepository;

class PermissionService extends BaseService
{

     public function __construct()
     {
          parent::__construct(new PermissionRepository());
     }

     protected function validateData(Request $request, $type = 'store')
     {
         // Validation rules
         $rules = [
             'directives' => 'required|array', // Ensure 'routes' is an array
             'directives.*.controllers' => 'required|array', // Validate 'controller' for each item
             'directives.*.name' => 'required|string|max:255', // Validate 'method' for each item
         ];
         // Validate the request data
         $validatedData = $request->validate($rules);

         return $validatedData;
     }

    public function createOrUpdate(Request $request)
    {
        $this->validateData($request);
        $this->repository->model->truncate();

	$directives = $request->input('directives');
	if (!is_array($directives)) {
            return response()->json(['error' => 'Invalid directives format'], 400);
        }

	$permissions = [];

	foreach ($directives as $directive) {
	    $this->repository = new PermissionRepository();
            $controllers = $directive['controllers'] ?? null;
            $name = $directive['name'] ?? null;
            if ($controllers && $name) {
                $permission = $this->repository->create(
                    ["controllers" => $controllers, "name" => $name]
                );
                $permissions[] = $permission; // Collect the created/updated permission
            }
        }
	return $permissions;
    }

}
