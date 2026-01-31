<?php

namespace App\Repositories\Eloquent\Usee;

use App\Models\Usee\Usee;
use App\Repositories\BaseRepository;

class UseeRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new Usee());
    }
}