<?php

namespace App\Repositories\Eloquent\Translate;

use App\Models\Translate\Translate;
use App\Repositories\BaseRepository;
use App\Traits\SendNotificationDataTrait;

 /**
 * TranslateRepository
 *
 * This class is responsible for handling the data operations related to the Translate model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Translate model as its target entity.
 */
class TranslateRepository extends BaseRepository
{
    use SendNotificationDataTrait;

    /**
     * TranslateRepository constructor.
     *
     * Initializes the repository by passing an instance of the Translate model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Translate data.
     */
    public function __construct()
    {
        // Pass a new instance of the Translate model to the parent BaseRepository constructor
        parent::__construct(new Translate());
    }

    // public function update($id, $data = null)
    // {
    //     // If no data passed, try to use request data
    //     if ($data === null) {
    //         $data = request()->all();
    //     }

    //     // Make sure $data is an array
    //     if (!is_array($data)) {
    //         throw new \InvalidArgumentException('Update data must be an array.');
    //     }

    //     // Prevent updating the ID fields
    //     unset($data['id'], $data['_id']);

    //     // Find model and update
    //     $model = $this->model->findOrFail($id);
    //     $model->fill($data);
    //     $model->save();

    //     return $model;
    // }

    public function update($id, $data = null)
    {
        // If no data passed, try to use request data
        if ($data === null) {
            $data = request()->all();
        }

        // Ensure $data is an array
        if (!is_array($data)) {
            throw new \InvalidArgumentException('Update data must be an array.');
        }

        // Prevent updating ID fields
        unset($data['id'], $data['_id']);

        // Find the model
        $model = $this->model->findOrFail($id);

        // Update the model
        $model->fill($data);
        $model->save();

        // If "name" exists in the data, delete duplicates with same name but different id
        if (isset($data['name'])) {
            $this->model
                ->where('name', $data['name'])
                ->where('_id', '!=', $model->_id)
                ->forceDelete();
        }

        return $model;
    }


}
