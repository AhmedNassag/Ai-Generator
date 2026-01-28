<?php

namespace App\Services\Eloquent\Phone;

use App\Services\BaseService;
use Illuminate\Http\Request;
use App\Repositories\Eloquent\Phone\PhoneRepository;

class PhoneService extends BaseService
{
    public function __construct()
    {
        parent::__construct(new PhoneRepository());
    }
    

    
    protected function validateData(Request $request, $type = 'store')
    {
        $validate = [];
        
        if ($type == 'store') {
            $validate = [
                'user_id' => 'required',
                'team_id' => 'required',
                'department_id' => 'required',
            ];
        }
        
        if ($type == 'update') {
            $validate = [
                'user_id' => 'required',
                'team_id' => 'required',
                'department_id' => 'required',
            ];
        }
        
        $request->validate($validate);
        return $request->all();
    }
}