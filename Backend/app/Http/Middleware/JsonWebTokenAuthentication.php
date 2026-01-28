<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;
use Firebase\JWT\ExpiredException;
use DomainException;
use InvalidArgumentException;
use UnexpectedValueException;

class JsonWebTokenAuthentication
{
    public function handle(Request $request, Closure $next)
    {

        $bearerToken = $request->bearerToken() ?? '';
        $key = config('jwt.secret');
        try {
            $user = JWT::decode($bearerToken, new Key($key, 'HS256'));
            // print_r($user);
            if ($user) {
                $request->attributes->add(['user' => $user]);
                $request->user = $user;
            }
            return $next($request);
        } catch (Exception $e) {
            return response()->json(['message' => 'Unauthorized'], 401);
            // provided JWT is malformed OR
            // provided JWT is missing an algorithm / using an unsupported algorithm OR
            // provided JWT algorithm does not match provided key OR
            // provided key ID in key/key-array is empty or invalid.
        }
    }
}
