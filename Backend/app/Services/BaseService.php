<?php

namespace App\Services;

use App\Repositories\BaseRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Traits\SendNotificationDataTrait;
/**
 * BaseService provides a set of methods for interacting with a repository
 * to perform CRUD operations and file uploads. It works as a service layer
 * that delegates logic to the repository and provides an abstraction layer
 * for handling database operations, file uploads, and validation.
 *
 * Methods:
 *
 * - __construct(BaseRepository $repository): Initializes the service with the provided repository.
 * - get(Request $request, $with = [], $withCount = []): Retrieves a collection of records with optional filters,
 *   sorting, and pagination.
 * - show($id, $with = []): Retrieves a single record by its ID with optional relationships.
 * - uploadFiles(Request $request): Handles file uploads and returns updated data with file paths.
 * - create(Request $request): Creates a new record in the database with validation and file uploads.
 * - update($id, Request $request): Updates an existing record in the database with validation and file uploads.
 * - delete($id): Deletes a record by its ID from the database.
 * - forceDelete($id): Permanently deletes a record from the database.
 * - validateData(Request $request, $type = 'store'): Validates the incoming request data for create or update operations.
 */
class BaseService
{
    protected $repository;
    /**
     * BaseService constructor.
     *
     * @param BaseRepository $repository
     */

    use SendNotificationDataTrait;
    public function __construct(BaseRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all records.
     *
     * @return mixed
     */
    public function get(Request $request, $with = [], $withCount = [])
    {
        $response = $this->repository->get($request, $with, $withCount);
        if (is_array($response) && $response['recordsTotal']) {
            $this->sendDataToPushNotification(substr(class_basename(static::class), 0, -strlen('Service')), 'index', request()->bearerToken());
        }
        return $response;
    }
    /**
     * Retrieve a single item by its ID.
     *
     * @param int $id The primary key of the item.
     * @param array $with Relationships to load (optional).
     * @return Model The model instance.
     */
    public function show($id, $with = [])
    {
        $response = $this->repository->show($id, $with);
        $this->sendDataToPushNotification(substr(class_basename(static::class), 0, -strlen('Service')), 'show', request()->bearerToken());
        return $response;
    }

    /**
     * Handle file upload and return updated data for storing.
     *
     * @param Request $request
     * @return array Updated data with file paths
     */
    // protected function uploadFiles(Request $request)
    // {
    //     $data = $request->all();

    //     // Handle file uploads if they exist
    //     foreach ($request->allFiles() as $key => $file) {
    //         // $path = $file->store("public/uploads/{$this->repository->model->getTable()}/$key");
    //         $path = $file->store("uploads/{$this->repository->model->getTable()}/$key", 'public');
    //         $data[$key] = $file->hashName();
    //     }

    //     return $data;
    // }


    protected function uploadFiles(Request $request)
    {
        $data = $request->all();

        foreach ($request->allFiles() as $key => $files) {
            // Get original input (might contain existing filenames or URLs)
            $originalInput = $request->input($key, []);

            // Extract just filenames from existing URLs
            $existingFiles = is_array($originalInput) ? $originalInput :
                ($originalInput ? [$originalInput] : []);

            $existingFiles = array_map(function ($item) {
                // If it's a URL, extract filename, otherwise keep as-is
                return filter_var($item, FILTER_VALIDATE_URL)
                    ? basename(parse_url($item, PHP_URL_PATH))
                    : $item;
            }, $existingFiles);

            // Normalize files to array format
            $fileArray = is_array($files) ? $files : [$files];

            foreach ($fileArray as $file) {
                if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                    $filename = $file->hashName();
                    $file->store("uploads/{$this->repository->model->getTable()}/$key", 'public');
                    $existingFiles[] = $filename; // Store just the filename
                }
            }

            // Maintain original structure (single or array)
            $data[$key] = is_array($files) ? $existingFiles : ($existingFiles[0] ?? null);
        }

        return $data;
    }

    /**
     * Create a new record.
     *
     * @param Request $request
     * @return mixed
     */
    public function create(Request $request)
    {
        // Validate the data
        $this->validateData($request);

        // Handle file uploads if needed
        $data = $this->uploadFiles($request);

        // Delegate to the repository to handle database insertion
        $response = $this->repository->create($data);

        $this->sendDataToPushNotification(substr(class_basename(static::class), 0, -strlen('Service')), 'insert', request()->bearerToken(), $response);

        return $response;
    }

    /**
     * Update an existing record.
     *
     * @param integer $id
     * @param Request $request
     * @return mixed
     */
    public function update($id, Request $request)
    {
        // Validate the data
        $this->validateData($request, 'update');

        // Handle file uploads if needed
        $data = $this->uploadFiles($request);

        $old_data = $this->repository->show($id);

        // Delegate to the repository to handle database update
        $response = $this->repository->update($id, $data);

        $this->sendDataToPushNotification(substr(class_basename(static::class), 0, -strlen('Service')), 'update', request()->bearerToken(), $response, $old_data);
        return $response;
    }

    /**
     * Added By Ahmed Nour
     * Updates or creates a new record.
     *
     * Validates the incoming request data, handles any file uploads,
     * and then delegates to the repository to perform the updateOrCreate operation.
     *
     * @param Request $request
     * @param array $conditions
     * @return mixed
     */
    public function updateOrCreate(Request $request)
    {
        // Validate data
        $this->validateData($request, 'updateOrCreate');

        // Handle file uploads if needed
        $data = $this->uploadFiles($request);

        // Delegate the updateOrCreate operation to the repository
        $response = $this->repository->updateOrCreate($data);

        $action = 'insert';
        $old_data = [];
        if (!empty($data['id'])) {
            $action = 'edit';
            $old_data = $this->repository->show($id);
            $this->sendDataToPushNotification(substr(class_basename(static::class), 0, -strlen('Service')), 'CreateOrUpdate', request()->bearerToken(), $response, $old_data);
            return $response;
        }

        $this->sendDataToPushNotification(substr(class_basename(static::class), 0, -strlen('Service')), 'CreateOrUpdate', request()->bearerToken(), $response);

        return $response;
    }

    /**
     * Delete a record from the database.
     *
     * @param int $id The primary key of the record.
     * @return bool Whether the deletion was successful.
     */
    public function delete($id)
    {
        $deletedItem = [];

        if ($id == 0) {
            $recordIds = request()->input('recordIds', []);
            if (is_array($recordIds) && count($recordIds) > 0) {
                $id = $recordIds[0];
                $deletedItem = $this->repository->show($id);
            }
        }else{
            $deletedItem = $this->repository->show($id);
        }

        $response = $this->repository->delete($id);
        $this->sendDataToPushNotification(substr(class_basename(static::class), 0, -strlen('Service')), 'delete', request()->bearerToken() , $deletedItem);
        return $response;
    }

    /**
     * Permanently delete a record from the database.
     *
     * @param int $id The primary key of the record.
     * @return bool Whether the force deletion was successful.
     */
    public function forceDelete($id)
    {
       $deletedItem = [];

        if ($id == 0) {
            $recordIds = request()->input('recordIds', []);
            if (is_array($recordIds) && count($recordIds) > 0) {
                $id = $recordIds[0];
                $deletedItem = $this->repository->show($id);
            }
        }else{
            $deletedItem = $this->repository->show($id);
        }

        $response = $this->repository->forceDelete($id);
        $this->sendDataToPushNotification(substr(class_basename(static::class), 0, -strlen('Service')), 'delete', request()->bearerToken() , $deletedItem);
        return $response;
    }

    /**
     * Validate request data.
     *
     * @param Request $request
     * @return void
     */
    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            'name' => 'required',
        ];
        $store = [...$validate];
        if ($type == 'store') {
            $request->validate($store);
        }
        if ($type == 'update') {
            $request->validate($validate);
        }
        if ($type == 'updateOrCreate') {
            $request->validate($validate);
        }
        return $request->all();
    }

    public function exportData(Request $request, bool $exportAll = false)
    {
        return $this->repository->exportExcel($request, $exportAll);

    }

    //this function use to make fetch rows of file sheet to make map and match between them and table columns before save in database
    public function fetchFileData(Request $request)
    {
        // The data
        $data = $request;

        // Delegate to the repository to handle database insertion
        return $this->repository->fetchFileData($data);
    }


    //this function use to make mapping and matching between the data and table columns  and save the matching in database
    public function storeFileData(Request $request)
    {
        // The data
        $data = $request;

        // Delegate to the repository to handle database insertion
        return $this->repository->storeFileData($data);
    }
}
