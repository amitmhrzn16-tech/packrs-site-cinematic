<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }
        if (!$user->is_admin) {
            throw ValidationException::withMessages(['email' => ['This account does not have admin access.']]);
        }

        $token = $user->createToken('admin-portal', ['admin'])->plainTextToken;

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'is_admin' => true],
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $u = $request->user();
        return response()->json([
            'user' => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'is_admin' => (bool) $u->is_admin],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['ok' => true]);
    }
}
