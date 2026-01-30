<?php

namespace App\Services\Eloquent\Language;

use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Language\LanguageRepository;
use Illuminate\Support\Facades\DB; // MongoDB's query can be done using this if you're using the default Laravel MongoDB setup

class LanguageService extends BaseService
{
    public function __construct()
    {
        parent::__construct(new LanguageRepository());
    }

    protected function validateData(Request $request, $type = 'store')
    {
        // Check if rtl is present, if not, set it to false
        if (!$request->has('rtl')) {
            $request->merge(['rtl' => 'false']);
        }

        // Validation rules for creating or updating languages
        $baseRules = [
            'code' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'flag' => 'required|string|max:255', // Validate flag[name]
            #'flag.id' => 'required|string|max:10',   // Validate flag[id]
            'order' => 'required|integer',
            'rtl' => 'required|in:true,false',
        ];

        if ($type == 'store') {
            $baseRules['code'] .= '|unique:languages,code,NULL,id,deleted_at,NULL';
            $baseRules['name'] .= '|unique:languages,name,NULL,id,deleted_at,NULL';
            $baseRules['order'] .= '|unique:languages,order,NULL,id,deleted_at,NULL';
        } else {
            $baseRules['code'] .= '|unique:languages,code,' . $request->id . ',id,deleted_at,NULL';
            $baseRules['name'] .= '|unique:languages,name,' . $request->id . ',id,deleted_at,NULL';
            $baseRules['order'] .= '|unique:languages,order,' . $request->id . ',id,deleted_at,NULL';
        }

        // Validate the request data
        $validatedData = $request->validate($baseRules);

        return $validatedData;
    }
}
