<?php

namespace App\Http\Middleware;

use App\Models\User\User;
use Closure;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class CheckCanVisitAPI
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if($request->header('x-api-key') && $request->header('x-api-key') == "d6d3f2b12c3a1f67e345b83d9c8a5f64e947b8d6e3f2b1c7a9e5f4d8a3b1c9f0"){
        }
        return $next($request);
        /*return response()->json([
            'code'      => 422,
            'error'     => true,
            'message'   => "You Don't Have Permission To Access This URL",
            'payload'   => null,
            'status'    => false,
	], 422);
	 */
    }
}
