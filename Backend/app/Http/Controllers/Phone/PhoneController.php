<?php

namespace App\Http\Controllers\Phone;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Phone\PhoneService;

class PhoneController extends BaseController
{
    public function __construct(PhoneService $service)
    {
        parent::__construct($service);
    }
}