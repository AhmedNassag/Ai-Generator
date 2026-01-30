<?php

namespace App\Repositories\Eloquent\Language;

use App\Models\Language\Language;
use App\Repositories\BaseRepository;
use Illuminate\Validation\ValidationException;

 /**
 * LanguageRepository
 *
 * This class is responsible for handling the data operations related to the Language model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Language model as its target entity.
 */
class LanguageRepository extends BaseRepository
{
    /**
     * LanguageRepository constructor.
     *
     * Initializes the repository by passing an instance of the Language model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Language data.
     */
    public function __construct()
    {
        // Pass a new instance of the Language model to the parent BaseRepository constructor
        parent::__construct(new Language());
    }


    public function delete($id)
    {
        if ($id == 0) {
            $id = request()->recordIds;
        }
    
        // Check if there's at least one document remaining in the collection (not deleted)
        $languagesCount = $this->model->whereNull('deleted_at')->count(); // MongoDB query for documents without 'deleted_at'
    
        if ($languagesCount <= 1) {
            // Raise a validation failure (ValidationException) if only one or no documents exist
            throw ValidationException::withMessages([
                'delete' => ['You cannot delete the last language record.']
            ]);
        }
    
        // Proceed with the deletion if there's more than one record
        return $this->model->destroy($id);
    }
     
    

}
