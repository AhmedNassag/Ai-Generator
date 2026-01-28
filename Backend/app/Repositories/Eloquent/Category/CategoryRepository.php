<?php

namespace App\Repositories\Eloquent\Category;

use App\Models\Category\Category;
use App\Repositories\BaseRepository;

class CategoryRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new Category());
    }
}