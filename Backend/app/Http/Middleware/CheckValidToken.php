<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class CheckValidToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $token = $request->bearerToken(); // Get token from Authorization header

            if (!$token) {
                return response()->json([
                    'error' => 'Authorization token not provided.',
                ], Response::HTTP_UNAUTHORIZED);
            }

            $payload = JWTAuth::setToken($token)->getPayload();

            $userId = $payload->get('sub'); // Retrieve the user_id from the token

            // Attach the decoded userId to the request
            $request->attributes->set('userId', $userId);
        } catch (TokenExpiredException $e) {
            return response()->json([
                'error' => 'Token has expired. Please log in again.',
            ], Response::HTTP_UNAUTHORIZED);
        } catch (TokenInvalidException $e) {
            return response()->json([
                'error' => 'Invalid token. Please provide a valid token.',
            ], Response::HTTP_UNAUTHORIZED);
        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Could not parse token. Please provide a valid token.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Allow the request to proceed
        return $next($request);
    }
}
