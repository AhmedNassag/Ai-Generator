<?php

namespace App\Services\Eloquent\Translate;

use App\Models\Translate\Translate;
use App\Services\BaseService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Repositories\Eloquent\Translate\TranslateRepository;

class TranslateService extends BaseService
{
     public function __construct()
     {
          parent::__construct(new TranslateRepository());
     }

     public function validateData(Request $request, $type = 'store')
     {
          // $validate = [
          //      'name' => [
          //           'required',
          //           'string',
          //           'max:255',
          //           Rule::unique('translates', 'name')->ignore($request->id),
          //      ],
          // ];
          $store = [
               'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:translates,name'
               ],
               // ...$validate
          ];
          if ($type == 'store') {
               $request->validate($store);
          }

          $update = [
               'name' => [
                    'required',
                    'string',
                    'max:255',
                    // Rule::unique('translates', 'name')->ignore($request->id),
               ],
               // ...$validate
          ];
          if ($type == 'update') {
               // $request->validate($validate);
               $request->validate($update);
          }
          return $request->all();
     }
}
