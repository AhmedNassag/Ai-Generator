<?php

namespace App\Services;

use App\Repositories\BaseRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


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
        return $this->repository->get($request, $with, $withCount);
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
        return  $this->repository->show($id, $with);
    }

    /**
     * Handle file upload and return updated data for storing.
     *
     * @param Request $request
     * @return array Updated data with file paths
     */
    protected function uploadFiles(Request $request)
    {
        $data = $request->all();

        // Handle file uploads if they exist
        foreach ($request->allFiles() as $key => $file) {
            $path = $file->store("public/uploads/{$this->repository->model->getTable()}/$key");
            $data[$key] = $file->hashName();
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
        return $this->repository->create($data);
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

        // Delegate to the repository to handle database update
        return $this->repository->update($id, $data);
    }
    /**
     * Delete a record from the database.
     *
     * @param int $id The primary key of the record.
     * @return bool Whether the deletion was successful.
     */
    public function delete($id)
    {
        return $this->repository->delete($id);
    }

    /**
     * Permanently delete a record from the database.
     *
     * @param int $id The primary key of the record.
     * @return bool Whether the force deletion was successful.
     */
    public function forceDelete($id)
    {
        return $this->repository->forceDelete($id);
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
        return $request->all();
    }

    public function exportData(Request $request, bool $exportAll = false)
    {
        return $this->repository->exportExcel($request, $exportAll);
    }
    public function refreshActions($request)
    {
        return $this->repository->refreshActions($request);
    }


}
