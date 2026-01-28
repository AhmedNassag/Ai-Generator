<?php

namespace App\Repositories\Eloquent\Position;

use App\Models\Position\Position;
use App\Repositories\BaseRepository;
use Illuminate\Validation\ValidationException;

 /**
 * PositionRepository
 *
 * This class is responsible for handling the data operations related to the Position model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Position model as its target entity.
 */
class PositionRepository extends BaseRepository
{
    /**
     * PositionRepository constructor.
     *
     * Initializes the repository by passing an instance of the Position model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Position data.
     */
    public function __construct()
    {
        // Pass a new instance of the Position model to the parent BaseRepository constructor
        parent::__construct(new Position());
    }
    public function delete($id)
    {
        if ($id == 0)
            $id = request()->recordIds;
        $position = $this->show($id);

        if ($position->departments()->count() > 0) {
            throw ValidationException::withMessages(['message' => 'Cannot delete position with associated departments']);
        }
        // Delete the record by its ID
        return parent::delete($id);
    }
}
