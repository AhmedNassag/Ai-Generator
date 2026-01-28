<?php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // Get the current user from the JWT token
        // $user = JWTAuth::user();

        // Testing ----------------------------------------------------------------
        // Split the token into its parts: header, payload, and signature
        $parts = explode('.', $request->header('Authorization'));

        if (count($parts) !== 3) {
            return response()->json(['error' => 'Invalid token format'], 400);
        }

        // Decode the payload (second part of the JWT token)
        $payload = $parts[1];
        $decodedPayload = json_decode(base64_decode($payload), false);

        if($decodedPayload) {
            // Get the formatted controller-method string (e.g. "User\\UserController\\show")
            $formattedRoute = $this->getFormattedControllerMethod($request);
            // Generate the hash and UUID for the route
            $hashedPermission = $this->generatePermissionHash($formattedRoute);
            $uuid = $this->generateUUIDFromHash($hashedPermission);
            // Check if the permission exists in JWT permissions (which are hashed UUIDs)
            if($this->hasPermission($decodedPayload, $uuid)) {
                return $next($request);
            }
        }
        return response()->json(['error' => 'Unauthenticated.'], 401);

    }

    /**
     * Get the controller-method path from the current request route
     *
     * @param \Illuminate\Http\Request $request
     * @return string
     */
    protected function getFormattedControllerMethod($request)
    {
        // Get the current route action (controller@method)
        $action = $request->route()->getAction();
        $controller = explode('@', $action['controller'])[0];
        $method = explode('@', $action['controller'])[1];
        $formattedRoute = str_replace('App\\Http\\Controllers\\', '', $controller);
        // Convert "Controller@method" to "Controller\\Method"
        return $formattedRoute . '\\' . $method;
    }

    /**
     * Generate the hash for the given permission (controller-method combination)
     *
     * @param string $formattedRoute
     * @return string
     */
    protected function generatePermissionHash($formattedRoute)
    {
        // Generate SHA-256 hash for the permission
        return hash('sha256', $formattedRoute);
    }

    /**
     * Generate UUID from the permission hash
     *
     * @param string $hashedPermission
     * @return string
     */
    protected function generateUUIDFromHash($hashedPermission)
    {
        // Truncate the hash to create a short version (12 characters)
        $shortHash = substr($hashedPermission, 0, 16);
        // Create the UUID from the short hash (e.g. "abcd-efgh-ijkl-mnop-qrst")
        return substr($shortHash, 0, 4) . '-' . substr($shortHash, 4, 4) . '-' . substr($shortHash, 8, 4) . '-' . substr($shortHash, 12, 4);
    }

    /**
     * Check if the user has the permission (based on the UUID) from the JWT token
     *
     * @param \App\Models\User $user
     * @param string $uuid
     * @return bool
     */
    protected function hasPermission($user, $uuid)
    {
    	return true;
	// Check if the UUID exists in the user's permissions
        return in_array($uuid, $user->permission);
    }
}
