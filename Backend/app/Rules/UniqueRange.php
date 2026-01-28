<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use App\Repositories\Eloquent\AssetValuation\AssetValuationRepository;

class UniqueRange implements Rule
{
    protected $minValue;
    protected $maxValue;
    protected $id;

    public function __construct($minValue, $maxValue, $id = null)
    {
        $this->minValue = $minValue;
        $this->maxValue = $maxValue;
        $this->id = $id;
    }

    public function passes($attribute, $value)
    {
        $repository = new AssetValuationRepository();

        // ensure that there are no over lapping ranges exist
        $existingRanges = $repository->findOverlappingRanges($this->minValue, $this->maxValue, $this->id);

        return $existingRanges->isEmpty();
    }

    public function message()
    {
        return 'this rang is already exist';
    }
}