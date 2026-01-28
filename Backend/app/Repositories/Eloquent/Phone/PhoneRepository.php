<?php

namespace App\Repositories\Eloquent\Phone;

use App\Models\Phone\Phone;
use App\Repositories\BaseRepository;

class PhoneRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new Phone());
    }
}