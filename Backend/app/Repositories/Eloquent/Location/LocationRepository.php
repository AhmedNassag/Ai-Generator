<?php

namespace App\Repositories\Eloquent\Location;

use App\Models\Location\Location;
use App\Repositories\BaseRepository;

 /**
 * LocationRepository
 *
 * This class is responsible for handling the data operations related to the Location model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Location model as its target entity.
 */
class LocationRepository extends BaseRepository
{
    /**
     * LocationRepository constructor.
     *
     * Initializes the repository by passing an instance of the Location model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Location data.
     */
    public function __construct()
    {
        // Pass a new instance of the Location model to the parent BaseRepository constructor
        parent::__construct(new Location());
    }
}
