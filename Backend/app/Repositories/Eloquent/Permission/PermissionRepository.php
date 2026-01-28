<?php

namespace App\Repositories\Eloquent\Permission;

use App\Models\Permission\Permission;
use App\Repositories\BaseRepository;

 /**
 * PermissionRepository
 *
 * This class is responsible for handling the data operations related to the Permission model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Permission model as its target entity.
 */
class PermissionRepository extends BaseRepository
{
    /**
     * PermissionRepository constructor.
     *
     * Initializes the repository by passing an instance of the Permission model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Permission data.
     */
    public function __construct()
    {
        // Pass a new instance of the Permission model to the parent BaseRepository constructor
        parent::__construct(new Permission());
    }
    /*
    public function create($data = null)
    {
        foreach($data["directives"] as $id => $permission) {
            // Create and save the new model instance
            $item = $this->model;
            if($permission->controllers && $permission->name)
                $item->updateOrCreate($permission);
        }

        return $data;
    }
    */
}
