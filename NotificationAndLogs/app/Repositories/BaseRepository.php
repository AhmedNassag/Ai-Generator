<?php

namespace App\Repositories;

use App\Events\NotificationPublic;
use App\Exports\DataExport;
use Carbon\Carbon;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

/**
 * BaseRepository provides a set of methods for interacting with a MongoDB database.
 * It facilitates basic CRUD operations (create, read, update, delete) and more advanced
 * operations such as filtering, sorting, and pagination.
 * This repository can be extended by other repositories to implement model-specific logic
 * and data retrieval strategies. It leverages Eloquent's MongoDB-based functionality
 * to interact with the database efficiently.
 *
 * Methods:
 *
 * - __construct(Model $model): Initializes the repository with the provided Eloquent model.
 * - create($data = null): Creates and saves a new model instance with the provided data.
 * - update($id, $data = null): Finds an existing model by ID and updates it with the provided data.
 * - show($id, $with = []): Retrieves a single model by its ID, optionally loading related relationships.
 * - get(Request $request, $with = [], $withCount = []): Retrieves a collection of models with optional filters,
 *   sorting, and pagination.
 * - dataTable($query, $request, $columns = [], $more = "", $moreData = []): Applies filtering, sorting, and pagination
 *   to a query for efficient data retrieval.
 * - where($query, $requestFilter): Applies a single filter to a query.
 * - delete($id): Deletes a model record by ID.
 * - forceDelete($id): Permanently deletes a model record by ID.
 *
 * The repository utilizes Laravel's built-in methods, such as `findOrFail`, `with`, and `withCount`,
 * along with Carbon for date manipulation and MongoDB-specific query handling. It supports complex filtering
 * mechanisms like regex, "in" filters, date ranges, and multiple condition types, allowing the repository
 * to interact flexibly with MongoDB.
 */

class BaseRepository
{
    /**
     * Eloquent model instance.
     */
    public $model;

    /**
     * Constructor to initialize the repository with the Eloquent model.
     *
     * @param Model $model Jenssegers\Mongodb\Eloquent\Model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Create a new record in the database.
     *
     * @param Request $request Illuminate\Http\Request
     * @param mixed $data Data to be stored (optional)
     * @return Model Saved model object with data.
     */
    public function create($data = null)
    {


        // Create and save the new model instance
        $item = $this->model;
        $item->fill($data);
        $item->save();

        return $item;
    }


    /**
     * Update an existing item in the database.
     *
     * @param int $id The primary key of the item.
     * @param Request $request Illuminate\Http\Request
     * @param mixed $data Data to update (optional)
     * @return Model Updated model object.
     */
    public function update($id,  $data = null)
    {


        // Find the item by its ID and update it
        if (is_numeric($id)) {
            $id = (int)$id;
        }

        $item = $this->model->findOrFail($id);
        $item->fill($data);
        $item->save();

        return $item;
    }

    /**
     * Retrieve a single item by its ID.
     *
     * @param int $id The primary key of the item.
     * @param array $with Relationships to load (optional).
     * @return Model The model instance.
     */
    public function show($id, $with = []): Model
    {
        return $this->model->with($with)->findOrFail($id);
    }

    /**
     * Retrieve a collection of items, with optional filters and pagination.
     *
     * @param Request $request Illuminate\Http\Request
     * @param array $with Relationships to load (optional).
     * @param array $withCount Relationships to count (optional).
     * @param array $columns Columns to select (optional).
     * @param string $more Additional custom filters (optional).
     * @param array $moreData Additional data for custom filters (optional).
     * @return \Illuminate\Database\Eloquent\Collection Paginated collection of models.
     */
    public function get(Request $request, $with = [], $withCount = [])
    {
        $query = $this->model->with($with)->withCount($withCount);
        return $this->dataTable($query, $request);
    }

    /**
     * Apply filtering, sorting, and pagination to a query.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query The query builder instance.
     * @param Request $request Illuminate\Http\Request
     * @param array $columns Columns to select (optional).
     * @param string $more Additional custom filters (optional).
     * @param array $moreData Additional data for custom filters (optional).
     * @return \Illuminate\Database\Eloquent\Collection Paginated collection of models.
     */
    public function dataTable($query, $request, $columns = [], $more = "", $moreData = [])
    {
        // Apply date filter if present
        if ($request->filterDate) {
            $filter = explode("|", $request->filterDate);
            if (count($filter) == 3) {
                $query->where($filter[0], $filter[2], Carbon::parse($filter[1]));
            } else {
                $query->where($filter[0], Carbon::parse($filter[1]));
            }
        }

        // Apply date range filter if present
        if ($request->filterDateBetween) {
            $filter = explode("|", $request->filterDateBetween);
            if (count($filter) == 3) {
                $query->whereBetween($filter[0], [Carbon::parse($filter[1]), Carbon::parse($filter[2])]);
            }
        }

        // Apply general filter if present
        if ($request->filter) {
            if (str_contains($request->filter, "&&")) {
                $filterArr = explode("&&", $request->filter);
                foreach ($filterArr as $value) {
                    $query = $this->where($query, $value);
                }
            } else {
                $query = $this->where($query, $request->filter);
            }
        }

        // Apply 'in' filter if present
        if ($request->filterIn) {
            $filter = explode("|", $request->filterIn);
            $in = explode(",", $filter[1]);
            $query->whereIn($filter[0], $in);
        }
        // Apply OR filtering if present
        if ($request->filterOr) {
            $filterArr = explode("||", $request->filterOr);
            $query->where(function ($subQuery) use ($filterArr) {
                foreach ($filterArr as $value) {
                    $filter = explode("|", $value);
                    if (count($filter) == 3) {
                        $subQuery->orWhere($filter[0], $filter[2], $filter[1]);
                    } else {
                        $subQuery->orWhere($filter[0], $filter[1]);
                    }
                }
            });
        }

        // Apply regex filter if present
        if ($request->regex) {
            $regex = explode("|", $request->regex);
            $query->where([$regex[0] => ['$regex' => $regex[1]]]);
        }

        // Return count if requested
        if ($request->count) return $query->count();

        // Apply sorting if present
        if ($request->sort) {
            $sort = explode("|", $request->sort);
            $query = $query->orderBy($sort[0], $sort[1]);
        } else {
            $query->orderBy("_id", "desc");
        }

        // Pagination settings
        $perPage = $request->perPage;
        $page = ($request->page - 1) * $perPage;

        // Apply search if present
        if ($request->search && ($request->search != "")) {
            if ($columns == []) {
                $columns = $this->model->getFillable(); // Default to model's fillable columns
            }

            $query->where(function ($query) use ($request, $columns, $more, $moreData) {
                if ($more != "") {
                    $query->orWhereIn($more, $moreData);
                }

                // Handle translations for columns (if any)
                $translate = $this->model->translate ? $this->model->translate : [];
                foreach ($columns as $column) {
                    if (in_array($column, $translate)) {
                        $query->orWhere($column . ".ar", 'LIKE', '%' . $request->search . '%')
                            ->orWhere($column . ".en", 'LIKE', '%' . $request->search . '%');
                    } else {
                        $query->orWhere($column, 'LIKE', '%' . $request->search . '%');
                    }
                }
            });
        }

        // Apply column selection if present
        if ($request->select) {
            $fields = explode("|", $request->select);
            $query = $query->select($fields);
        }

        // Return paginated results
        if (!$request->perPage) return $query->get();
        $paginatedData=    $query->skip($page)->paginate($perPage);
        return [
            'recordsTotal' => $paginatedData->total(),
            'recordsFiltered' => $paginatedData->total(),
            'data' => $paginatedData->items(),
        ];

    }

    /**
     * Apply a filter to the query.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query The query builder instance.
     * @param string $requestFilter The filter to apply.
     * @return \Illuminate\Database\Eloquent\Builder The modified query.
     */
    function where($query, $requestFilter)
    {
        $filter = explode("|", $requestFilter);
        if (count($filter) == 3) {
            $type = explode("-", $filter[1]);
            if (count($type) == 2) {
                settype($type[0], $type[1]);
                $query->where($filter[0], $filter[2], $type[0]);
            } else {
                $query->where($filter[0], $filter[2], $filter[1]);
            }
        } else {
            $type = explode("-", $filter[1]);
            if (count($type) == 2) {
                settype($type[0], $type[1]);
                $query->whereRaw([$filter[0] => $type[0]]);
            } else {
                $query->whereRaw([$filter[0] => $filter[1]]);
            }
        }
        return $query;
    }

    /**
     * Delete a record from the database.
     *
     * @param int $id The primary key of the record.
     * @return bool Whether the deletion was successful.
     */
    public function delete($id)
    {
        if ($id == 0)
            $id = request()->recordIds;

        // Delete the record by its ID
        return $this->model->destroy($id);
    }

    /**
     * Permanently delete a record from the database.
     *
     * @param int $id The primary key of the record.
     * @return bool Whether the force deletion was successful.
     */
    public function forceDelete($id)
    {
        if ($id == 0) {
            return $this->model->whereIn('_id', request()->recordIds)->forceDelete();
        } else {
            return $this->model->where('_id', $id)->forceDelete();
        }
    }



    /**
     * Get the fields present in the model.
     *
     * @return array List of unique field names.
     */
    protected function getFields()
    {
        return $this->model->raw(function ($collection) {
            $cursor = $collection->find();
            $array = iterator_to_array($cursor);
            $fields = array();
            foreach ($array as $k => $v) {
                foreach ($v as $a => $b) {
                    $fields[] = $a;
                }
            }
            return array_values(array_unique($fields));
        });
    }

    public function exportExcel(Request $request,bool $exportAll = true)
    {
        // Determine whether to export all data or current page
        if ($exportAll) {
            // Get all data without pagination
            $query = $this->model->query();
            $data = $this->dataTable($query, $request)['data'];
        } else {
            // Get only paginated data (current page)
            $query = $this->model->query();
            $paginatedData = $this->dataTable($query, $request);
            $data = $paginatedData;
        }

        $columns = array_keys($data[0]->toArray());

        // Prepare data for Excel export
        $exportData = collect($data)->map(function ($item) use ($columns) {
            return collect($item)->only($columns)->toArray();
        });

        // Use Laravel Excel to generate the file
        return Excel::download(
            new DataExport($exportData->toArray(), $columns),
            $this->model->getTable().'.xlsx'
        );
    }
    function fillable()
    {
        return  $this->model->getFillable();
    }
}
