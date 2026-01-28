<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UniqueContactEmail implements ValidationRule
{
    private static $emails = [];
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (in_array($value, self::$emails)) {
            $fail('The email must be unique across all contact types.');
        }

        self::$emails[] = $value;
    }
}
