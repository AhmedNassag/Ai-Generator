<?php

namespace App\Http\Controllers\Utils;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Support\Arrayable;

class ResponseController extends Controller
{
    /**
     * Return a success response with the provided data
     *
     * This method returns a standard success response. If the request is from a mobile
     * endpoint (identified by the URL containing 'mobile'), it adds an `errorCode` of 1
     * and wraps the data under a 'data' key.
     *
     * @param mixed $items The data to return in the response
     * @return \Illuminate\Http\JsonResponse
     */
    public function ok($items = null)
    {
        // Check if the current URL is for a mobile endpoint
        if (str_contains(url()->current(), 'mobile')) {
            // Return a mobile-friendly success response
            return response()->json(['data' => $items, 'errorCode' => 1])
                ->setEncodingOptions(JSON_NUMERIC_CHECK);
        }

        // Return a standard success response
        return response()->json($items)
            ->setEncodingOptions(JSON_NUMERIC_CHECK);
    }

    /**
     * Return a success response with a status and additional data
     *
     * This method returns a success response with a status code and any additional data.
     * It checks if the request is from a mobile endpoint and formats the response accordingly.
     *
     * @param mixed $items The data to return in the response
     * @param int $status The HTTP status code (default: 200)
     * @return \Illuminate\Http\JsonResponse
     */
    public function success($items = null, $status = 200)
    {
        $data = ['status' => 'success'];

        // If the items are Arrayable, convert them to an array
        if ($items instanceof Arrayable) {
            $items = $items->toArray();
        }

        // Merge the additional items into the response data
        if ($items) {
            foreach ($items as $key => $item) {
                $data["data"][$key] = $item;
            }
        }

        // Check if the current URL is for a mobile endpoint
        if (str_contains(url()->current(), 'mobile')) {
            // Return a mobile-friendly success response with the status
            return response()->json(['data' => $data, 'errorCode' => 1], 200);
        }

        // Return a standard success response with the status
        return response()->json($data, (int) 200);
    }

    /**
     * Return an error response with the provided data
     *
     * This method returns an error response, with any error messages included in the `errors`
     * key. It also checks if the request is coming from a mobile endpoint and formats the
     * response accordingly.
     *
     * @param mixed $items The error messages to return in the response
     * @param int $status The HTTP status code (default: 422)
     * @return \Illuminate\Http\JsonResponse
     */
    public function error($items = null, $status = 422)
    {
        $data = [];

        // If error messages are provided, format them into the 'errors' array
        if (is_array($items)) {
            foreach ($items as $key => $item) {
                $data['errors'][$key][] = $item;
            }
        }

        // Check if the current URL is for a mobile endpoint
        if (str_contains(url()->current(), 'mobile')) {
            // Return a mobile-friendly error response
            return response()->json(['data' => $data, 'errorCode' => 0], (int) $status)
                ->setEncodingOptions(JSON_NUMERIC_CHECK);
        }

        // Return a standard error response
        return response()->json($data,(int)  $status)
            ->setEncodingOptions(JSON_NUMERIC_CHECK);
    }

    
}
