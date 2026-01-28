<?php

namespace App\Repositories\Eloquent\Log;

use App\Models\Log\Log;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\Request;

/**
 * LogRepository
 *
 * This class is responsible for handling the data operations related to the Log model.
 * It extends the BaseRepository class, leveraging the shared repository functionality,
 * such as CRUD operations, and specifies the Log model as its target entity.
 */
class LogRepository extends BaseRepository
{
    /**
     * LogRepository constructor.
     *
     * Initializes the repository by passing an instance of the Log model to the parent BaseRepository.
     * This setup allows the BaseRepository methods to work specifically with Log data.
     */
    public function __construct()
    {
        // Pass a new instance of the Log model to the parent BaseRepository constructor
        parent::__construct(new Log());
    }

    public function getModelLogs($modelName,$recordId)
    {
        $requestLogs = Log::where('class',$modelName )
        ->where('data.id', $recordId)
        ->get();

        $commentLogs = Log::where('class','Comment')
        ->where('data.commentable_id', $recordId)
        ->where(function ($query) {
            $query->where('data.is_private', true)
                  ->orWhere('data.is_private', 'true'); // checks both boolean and string 'true'
        })->get();

        $merged = $requestLogs->merge($commentLogs);

        $sortedLogs = $merged->sortByDesc('created_at')->values();
        return $sortedLogs;
    }

    public function getLogMultiModels($request)
    {  // $request->filter = "Log|1||Comment|2";
        $filter = $request->filter;
        $filterItems = explode("||", $filter);
        
        // Remove empty items
        $filterItems = array_filter($filterItems, function($item) {
            return !empty(trim($item));
        });


        $modelLogs = $this->model->newQuery();
        
        $isExecuting = false;
        // Use orWhere to create OR conditions between different model/record combinations
        $modelLogs->where(function($query) use ($filterItems, &$isExecuting) {
            foreach ($filterItems as $item) {
                $itemParts = explode("|", trim($item));
                if (count($itemParts) == 3) {
                    $modelClass = trim($itemParts[0]);
                    $attributeName = trim($itemParts[1]);
                    $recordId = trim($itemParts[2]);
                    
                    // Skip if either part is empty
                    if (empty($modelClass) || empty($recordId)) {
                        continue;
                    }

                    $query->orWhere(function($subQuery) use ($modelClass, $attributeName, $recordId) {
                        $subQuery->where('class', $modelClass)
                                ->where($attributeName, $recordId);
                    });
                    $isExecuting = true;
                }
            }
        });

        if(!$isExecuting) {
            // If no valid filter items were found, return an empty collection
            return collect();
        }
        // Order by creation date (newest first) and paginate
        $sortedLogs = $modelLogs->orderByDesc('created_at')->get();
        return $sortedLogs;
    }
}
