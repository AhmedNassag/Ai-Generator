<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class DataExport implements FromArray, WithHeadings
{
    private array $data;
    private array $columns;

    public function __construct(array $data, array $columns)
    {
        $this->data = $data;
        $this->columns = $columns;
    }

    public function array(): array
    {
        return $this->data;
    }

    public function headings(): array
    {
        return $this->columns;
    }
}
