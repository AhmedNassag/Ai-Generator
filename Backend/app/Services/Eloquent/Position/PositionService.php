<?php

namespace App\Services\Eloquent\Position;

use App\Models\Position\Position;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Position\PositionRepository;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PositionService extends BaseService
{
    protected $positionRepository;

    public function __construct()
    {
        parent::__construct(new PositionRepository());
        $this->positionRepository = new PositionRepository();
    }

    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            'name' => [
                'required',
                'string',
                Rule::unique('positions', 'name')->ignore($request->id),
            ],
            'code' => [
                'required',
                'string',
                Rule::unique('positions', 'code')->ignore($request->id),
            ],
            // 'description' => 'required|string',
            // 'job_id' => 'array',
        ];

        $store = [
            'name' => 'required|string|unique:positions,name',
            'code' => 'required|string|unique:positions,code',
            ...$validate
        ];

        if ($type == 'store') {
            $request->validate($store);
        }
        if ($type == 'update') {
            $request->validate($validate);
        }

        return $request->all();
    }

    public function delete($positionId)
    {
        if ($positionId == 0)
            $positionId = is_array(request()->recordIds) ? request()->recordIds[0] : request()->recordIds;

        $position = $this->positionRepository->show($positionId, ['jobs']);

        if ($position->jobs->count() > 0) {
            throw ValidationException::withMessages(["Can't delete position has related data"]);
        }

        return parent::delete($positionId);
    }
}
