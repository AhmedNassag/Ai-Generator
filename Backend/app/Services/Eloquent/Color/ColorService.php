<?php

namespace App\Services\Eloquent\Color;

use App\Models\Color\Color;
use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Color\ColorRepository;
use Illuminate\Validation\ValidationException;

class ColorService extends BaseService
{
     protected $colorRepository;

     public function __construct()
     {
          parent::__construct(new ColorRepository());
          $this->colorRepository = new ColorRepository();
     }
     protected function validateData(Request $request, $type = 'store')
     {
          // Validation Update
          $validate = [
               'name' => 'required|string|max:255|unique:colors,name,' . $request->id . ',id,deleted_at,NULL',
               'hexcolor' => 'required|string|size:7|unique:colors,hexcolor,' . $request->id . ',id,deleted_at,NULL',
           ];

          // Validation Store
          $store = [
               'name' => 'required|string|max:255|unique:colors,name,NULL,id,deleted_at,NULL',
               'hexcolor' => 'required|string|size:7|unique:colors,hexcolor,NULL,id,deleted_at,NULL',
           ];
          if ($type == 'store') {
               $request->validate($store);
          }
          if ($type == 'update') {
               $request->validate($validate);
          }

          return $request->all();
     }

     public function delete($colorId)
     {
         if ($colorId == 0)
             $colorId = is_array(request()->recordIds) ? request()->recordIds[0] : request()->recordIds;

         $color = $this->colorRepository->show($colorId, ['departments']);

         if ($color->departments->count() > 0) {
             throw ValidationException::withMessages(["Can't delete color has related data in department"]);
         }

         return parent::delete($colorId);
     }
}
