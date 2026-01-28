<?php

namespace App\Rules;

use App\Models\Domain\Domain;
use Illuminate\Contracts\Validation\Rule;

class ValidateDomainOrder implements Rule
{
    protected $id;
    protected $parent_id;

    /**
     * Create a new rule instance.
     *
     * @param int|null $id The ID of the domain being validated (null for create)
     * @param int|null $parent_id The parent_id of the domain being validated
     */
    public function __construct($id, $parent_id)
    {
        $this->id = $id;
        $this->parent_id = $parent_id;
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param string $attribute The attribute being validated (e.g., "order")
     * @param mixed $order The value of the attribute
     * @return bool
     */
    public function passes($attribute, $order)
    {
        // Ensure the order is a positive integer
        if (!is_numeric($order) || $order <= 0) {
            return false;
        }

        // Initialize the array to store unavailable order values
        $NotAvailableOrder = [];

        if (is_null($this->parent_id)) {
            // Case 1: Top-level domain (parent_id is null)
            $query = Domain::whereNull('parent_id');

            // Exclude the current domain if updating
            if ($this->id) {
                $query->where('id', '<>', $this->id);
            }

            $NotAvailableOrder = $query->pluck('order')->toArray();
        } else {
            // Case 2: Sub-domain (parent_id is not null)
            $parentDomain = Domain::find($this->parent_id);

            if ($parentDomain) {
                $query = $parentDomain->familiesOlny();

                // Exclude the current sub-domain if updating
                if ($this->id) {
                    $query->where('id', '<>', $this->id);
                }

                $NotAvailableOrder = $query->pluck('order')->toArray();
            }
        }

        // Check if the order value is available
        return !in_array($order, $NotAvailableOrder);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return __('locale.ThisOrderNumberIsNotAvailable');
    }
}