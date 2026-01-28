<?php

namespace App\Services\Eloquent\Category;

use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Category\CategoryRepository;

class CategoryService extends BaseService
{
    public function __construct()
    {
        parent::__construct(new CategoryRepository());
    }
    

    
    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [];
        
        if ($type == 'store') {
            $validate = [
                'name' => 'required|string|max:255',
            ];
        }
        
        if ($type == 'update') {
            $validate = [
                'name' => 'required|string|max:255',
            ];
        }
        
        $request->validate($validate);
        return $request->all();
    }
}