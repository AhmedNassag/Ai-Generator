<?php

namespace App\Http\Controllers\Usee;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Usee\UseeService;

class UseeController extends BaseController
{
    public function __construct(UseeService $service)
    {
        parent::__construct($service);
    }
}