<?php

namespace App\Repositories\Eloquent\Color;

use App\Models\Color\Color;
use App\Repositories\BaseRepository;

 /**
 * ColorRepository
 *
 * This class is responsible for handling the data operations related to the Color model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Color model as its target entity.
 */
class ColorRepository extends BaseRepository
{
    /**
     * ColorRepository constructor.
     *
     * Initializes the repository by passing an instance of the Color model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Color data.
     */
    public function __construct()
    {
        // Pass a new instance of the Color model to the parent BaseRepository constructor
        parent::__construct(new Color());
    }
}
