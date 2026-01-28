<?php

namespace App\Http\Controllers\Utils;

use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Http\Controllers\Utils\ResponseController;

/**
 * BaseController provides a set of methods for managing records in the database.
 * It extends the `ResponseController` class, allowing it to leverage standardized response formats.
 * The controller uses the `BaseService` to handle the business logic, including CRUD operations.
 * It provides methods for retrieving, creating, updating, and deleting records, along with standardized responses.
 *
 * Methods:
 *
 * - __construct(BaseService $baseService): Initializes the controller with the BaseService.
 * - index(Request $request): Retrieves a collection of items from the database with optional filters,
 *   sorting, and pagination. Returns a success response or error.
 * - show($id): Retrieves a single record by its ID. Returns the record in a success response or error.
 * - store(Request $request): Accepts incoming request data, creates a new record, and returns it in a
 *   success response.
 * - update($id, Request $request): Accepts the record ID and updated data, updates the record, and
 *   returns the updated record in a success response or error.
 * - destroy($id): Deletes a record from the database. If `forceDelete=true` is passed, it permanently deletes
 *   the record. Returns a success response or error.
 */
class BaseController extends ResponseController
{
    protected $baseService;

    /**
     * BaseController constructor.
     * This constructor initializes the BaseService to handle the business logic and data manipulation.
     * The ResponseController is extended, so the methods for formatting responses are inherited.
     *
     * @param BaseService $baseService Service layer for handling business logic.
     */
    public function __construct(BaseService $baseService)
    {
        $this->baseService = $baseService;
    }

    /**
     * Get a list of items from the database.
     * This method handles retrieving a collection of records from the model.
     * It uses the BaseService to fetch the data and returns it in a standardized response format.
     *
     * @param Request $request The request object containing filtering, pagination, and sorting parameters.
     * @return \Illuminate\Http\Response Returns a JSON response with a status of success and the data.
     */
    public function index(Request $request)
    {
        try {
            $with = [];
            if ($request->has('with')) {
                $with = $request->with;
            }
            $withCount = [];
            if ($request->has('withCount')) {
                $withCount = $request->withCount;
            }
            // Call the service layer to get the list of items based on the request filters.
            $with = $request->input('with', []);
            $withCount = $request->input('withCount', []);
            $items = $this->baseService->get($request, $with , $withCount);
            // Return a success response with the retrieved items.
            return $this->ok($items);
        } catch (\Exception $e) {
            // In case of error, return a standardized error response.
            return $this->error([$e->getMessage()]);
        }
    }
    /**
     * Show a single record from the database.
     * This method retrieves a single record by its ID and returns it.
     * If the record is found, it will be returned in a standardized success response.
     *
     * @param int $id The ID of the record to retrieve.
     * @return \Illuminate\Http\Response Returns a JSON response with the status of success and the data.
     */
    public function show($id)
    {
        try {
            $with = [];
            if (request()->has('with')) {
                $with = request()->with;
            }
            // Retrieve the item by its ID using the service layer.
            $item = $this->baseService->show($id,$with);
            // Return a success response with the found item.
            return $this->ok($item);
        } catch (\Exception $e) {
            // If an error occurs, return a standardized error response.
            return $this->error([$e->getMessage()]);
        }
    }

    /**
     * Create a new record in the database.
     * This method accepts incoming request data, processes it, and stores a new record.
     * After successful creation, it returns the newly created record in a success response.
     *
     * @param Request $request The incoming request with the data to create a new record.
     * @return \Illuminate\Http\Response Returns a JSON response with the status of success and the created data.
     */
    public function store(Request $request)
    {
        // Call the service to handle the creation of the new record.
        $item = $this->baseService->create($request);
        // Return a success response with the newly created item.
        return $this->success($item, 'Record created successfully');
    }

    /**
     * Update an existing record in the database.
     * This method accepts the record ID and updated data, and updates the record accordingly.
     * Upon successful update, it returns the updated record in a success response.
     *
     * @param int $id The ID of the record to update.
     * @param Request $request The incoming request with the updated data.
     * @return \Illuminate\Http\Response Returns a JSON response with the status of success and the updated data.
     */
    public function update($id, Request $request)
    {
        try {
            $request['id'] = $id;

            // Call the service layer to update the record with the given ID and data.
            $item = $this->baseService->update($id, $request);
            // Return a success response with the updated item.
            return $this->success($item, 'Record updated successfully');
        } catch (\Exception $e) {
            // Return an error response if the update fails.
            return $this->error([$e->getMessage()]);
        }
    }
    /**
     * Delete or force delete a record from the database.
     * This method deletes the record identified by the provided ID.
     * If `forceDelete=true` is passed in the request, the record is permanently deleted.
     *
     * @param int $id The ID of the record to delete.
     * @return \Illuminate\Http\Response Returns a JSON response with a success message upon successful deletion.
     */
    public function destroy($id)
    {
        try {
            // Check if the request contains `forceDelete=true`.
            $forceDelete = request()->input('forceDelete', false);

            if ($forceDelete) {
                // Call the service layer to force delete the record.
                $this->baseService->forceDelete($id);
                return $this->success(null, 'Record force deleted successfully');
            }

            // Call the service layer to soft delete the record.
            $this->baseService->delete($id);
            return $this->success(null, 'Record deleted successfully');
        } catch (\Exception $e) {
            // Return an error response if the deletion fails.
            return $this->error([$e->getMessage()]);
        }
    }

    public function exportDataToExcell(Request $request)
    {
        $exportAll = $request->has('export_all');
        return $this->baseService->exportData($request, $exportAll);
    }


    public function fetchFileData(Request $request)
    {
        $item = $this->baseService->fetchFileData($request);
        // Return a success response with the newly fetched data.
        return $this->success($item, 'Data fetched successfully');
    }



    //this function use to make fetch rows of file sheet to make map and match between them and table columns before save in database
    public function storeFileData(Request $request)
    {
        $item = $this->baseService->storeFileData($request);
        // Return a success response with the newly created data.
        return $this->success(null, 'Data created successfully');
    }

    /**
     * Update an existing record in the database, or create a new record if it does not exist.
     * This method accepts the updated data and the record ID to update, and updates the record accordingly.
     * If the record does not exist, it creates a new record with the given data.
     * Upon successful update or creation, it returns the updated or newly created record in a success response.
     *
     * @param Request $request The incoming request with the updated data.
     * @return \Illuminate\Http\Response Returns a JSON response with the status of success and the updated or created data.
     */
    public function updateOrCreate( Request $request)
    {
        try {
            $item = $this->baseService->updateOrCreate( $request);
            return $this->success($item, 'Record created or updated successfully');
        } catch (\Exception $e) {
            return $this->error([$e->getMessage()]);
        }
    }
}
