<?php

namespace App\Services\Eloquent\Location;

use App\Models\Location\Location;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Location\LocationRepository;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LocationService extends BaseService
{
    protected $locationRepository;

    public function __construct()
    {
        parent::__construct(new LocationRepository());
        $this->locationRepository = new LocationRepository();
    }

    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [
            'name' => [
                'required',
                'string',
                Rule::unique('locations', 'name')->ignore($request->id),
            ],
        ];

        $store = [
            'name' => 'required|string|unique:locations,name',
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

    public function delete($locationId)
    {
        if ($locationId == 0)
            $locationId = is_array(request()->recordIds) ? request()->recordIds[0] : request()->recordIds;

        $location = $this->locationRepository->show($locationId, ['assets', 'risks']);

        if ($location->assets->count() > 0 || $location->risks->count() > 0) {
            throw ValidationException::withMessages(["Can't delete location has related data"]);
        }

        return parent::delete($locationId);
    }
}
