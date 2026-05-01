<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const RESET_TOKEN_TTL_MINUTES = 60;
    private const VERIFY_TOKEN_TTL_HOURS = 24;

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
        if (!$user->email_verified_at) {
            throw ValidationException::withMessages(['email' => ['Please verify your email before signing in.']]);
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

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:120'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $token = Str::random(64);

        $user = User::create([
            'name'                       => $data['name'],
            'email'                      => $data['email'],
            'password'                   => $data['password'],
            'is_admin'                   => false,
            'email_verification_token'   => hash('sha256', $token),
            'email_verification_sent_at' => now(),
        ]);

        $this->sendVerifyEmail($user, $token);

        return response()->json([
            'message' => 'Account created. Check your email to verify your address. An admin must elevate the account before it can sign in to the admin portal.',
        ], 201);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $hashed = hash('sha256', $data['token']);
        $user = User::where('email_verification_token', $hashed)->first();

        if (!$user) {
            throw ValidationException::withMessages(['token' => ['This verification link is invalid or has already been used.']]);
        }

        $sentAt = $user->email_verification_sent_at;
        if ($sentAt && $sentAt->lt(now()->subHours(self::VERIFY_TOKEN_TTL_HOURS))) {
            throw ValidationException::withMessages(['token' => ['This verification link has expired. Please request a new one.']]);
        }

        $user->forceFill([
            'email_verified_at'        => now(),
            'email_verification_token' => null,
        ])->save();

        return response()->json([
            'message' => 'Email verified. An admin still needs to grant you admin access before you can sign in to the admin portal.',
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $data['email'])->first();
        $generic = ['message' => 'If that account exists and is unverified, a new verification email has been sent.'];

        if (!$user || $user->email_verified_at) {
            return response()->json($generic);
        }

        $token = Str::random(64);
        $user->forceFill([
            'email_verification_token'   => hash('sha256', $token),
            'email_verification_sent_at' => now(),
        ])->save();

        $this->sendVerifyEmail($user, $token);

        return response()->json($generic);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $data['email'])->first();
        $generic = ['message' => 'If that account exists, a password reset link has been sent.'];

        if (!$user) {
            return response()->json($generic);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()],
        );

        $resetUrl = $this->frontendUrl('/admin/reset-password?token=' . $token . '&email=' . urlencode($user->email));

        Mail::to($user->email)->send(new ResetPasswordMail(
            name: $user->name,
            resetUrl: $resetUrl,
            expiresMinutes: self::RESET_TOKEN_TTL_MINUTES,
        ));

        return response()->json($generic);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'token'    => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $row = DB::table('password_reset_tokens')->where('email', $data['email'])->first();
        if (!$row || !Hash::check($data['token'], $row->token)) {
            throw ValidationException::withMessages(['token' => ['This reset link is invalid or has already been used.']]);
        }

        $createdAt = Carbon::parse($row->created_at);
        if ($createdAt->lt(now()->subMinutes(self::RESET_TOKEN_TTL_MINUTES))) {
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
            throw ValidationException::withMessages(['token' => ['This reset link has expired. Please request a new one.']]);
        }

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            throw ValidationException::withMessages(['email' => ['No account found for this email.']]);
        }

        $user->forceFill(['password' => $data['password']])->save();
        $user->tokens()->delete();
        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return response()->json(['message' => 'Password updated. You can now sign in.']);
    }

    private function sendVerifyEmail(User $user, string $token): void
    {
        $verifyUrl = $this->frontendUrl('/admin/verify-email?token=' . $token);
        Mail::to($user->email)->send(new VerifyEmailMail(
            name: $user->name,
            verifyUrl: $verifyUrl,
        ));
    }

    private function frontendUrl(string $path): string
    {
        $base = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');
        return $base . $path;
    }
}
