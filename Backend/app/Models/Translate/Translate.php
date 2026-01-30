<?php

namespace App\Models\Translate;

use MongoDB\Laravel\Eloquent\Model;

class Translate extends Model
{
    protected $collection = 'translate';

    protected $fillable = ['name','group', 'search_text'];
    protected $guarded = [];

    /**
     * Boot method to auto-generate search_text on save
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            $model->search_text = $model->buildSearchText();
        });
    }

    /**
     * Allow all attributes to be fillable dynamically.
     */
    public function fill(array $attributes)
    {
        $this->fillable(array_unique(array_merge($this->fillable, array_keys($attributes))));
        return parent::fill($attributes);
    }

   public function buildSearchText()
    {
        $searchParts = [];

        // Loop through all attributes
        foreach ($this->attributes as $key => $value) {
            // Skip MongoDB internals, name, group, and search_text itself
            if (in_array($key, ['_id', 'name', 'group', 'search_text', 'created_at', 'updated_at'])) {
                continue;
            }

            // If it's an array (like ar, en, FRn), extract all keys from all items in first array
            if (is_array($value) && !empty($value)) {
                foreach ($value as $item) {
                    if (is_array($item)) {
                        $searchParts = array_merge($searchParts, array_keys($item));
                    }
                }
                break; // Stop after processing the first array (ar, en, or FRn)
            }
        }

        // Remove duplicates and join WITHOUT spaces
        return implode('', array_unique($searchParts));
    }
}