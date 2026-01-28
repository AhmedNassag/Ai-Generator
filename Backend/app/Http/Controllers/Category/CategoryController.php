<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Utils\BaseController;
use App\Services\Eloquent\Category\CategoryService;

class CategoryController extends BaseController
{
    public function __construct(CategoryService $service)
    {
        parent::__construct($service);
    }
}