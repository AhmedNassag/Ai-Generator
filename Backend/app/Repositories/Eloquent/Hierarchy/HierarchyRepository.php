<?php

namespace App\Repositories\Eloquent\Hierarchy;

use App\Models\Department\Department;
use App\Models\Hierarchy\Hierarchy;
use App\Models\User\User;
use App\Repositories\BaseRepository;

/**
 * HierarchyRepository
 *
 * This class is responsible for handling the data operations related to the Hierarchy model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Hierarchy model as its target entity.
 */
class HierarchyRepository extends BaseRepository
{
    /**
     * HierarchyRepository constructor.
     *
     * Initializes the repository by passing an instance of the Hierarchy model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Hierarchy data.
     */
    public function __construct()
    {
        // Pass a new instance of the Hierarchy model to the parent BaseRepository constructor
        parent::__construct(new Hierarchy());
    }







}
