<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sinif;
use App\Models\User;
use App\Support\AvatarHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:80', 'unique:users,name'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:ogrenci,hoca'],
            'sinif' => ['nullable', 'string', 'max:120'],
            'sinif_kodu' => ['nullable', 'string', 'min:4', 'max:20'],
            'avatar' => ['nullable', 'string', 'max:500'],
        ]);

        $nameSafe = Str::slug(Str::lower($validated['name']), '');
        $nameSafe = substr(preg_replace('/[^a-z0-9]/', '', $nameSafe) ?: 'kullanici', 0, 15);
        $email = $nameSafe.'_'.Str::random(6).'@lisaniecdad.app';

        while (User::where('email', $email)->exists()) {
            $email = $nameSafe.'_'.Str::random(6).'@lisaniecdad.app';
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $email,
            'password' => $validated['password'],
            'avatar' => $validated['avatar'] ?? AvatarHelper::defaultHtml(),
            'role' => $validated['role'],
            'sinif_adi' => $validated['role'] === 'hoca' ? ($validated['sinif'] ?? null) : null,
        ]);

        if ($user->role === 'hoca') {
            Sinif::create([
                'hoca_id' => $user->id,
                'hoca_adi' => $user->name,
                'sinif_adi' => $user->sinif_adi ?: ($user->name."'in Grubu"),
                'kisa_kod' => Sinif::generateKisaKod(),
                'ogrenciler' => [],
                'odevler' => [],
            ]);
        }

        if ($user->role === 'ogrenci' && ! empty($validated['sinif_kodu'])) {
            Sinif::joinUser($user, $validated['sinif_kodu']);
        }

        Auth::login($user, $request->boolean('remember'));

        return response()->json([
            'success' => true,
            'user' => $user->fresh()->toFrontendArray(),
            'csrf_token' => csrf_token(),
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        $user = User::whereRaw('LOWER(name) = ?', [Str::lower($validated['name'])])->first();

        if (! $user || $user->role === 'bot') {
            throw ValidationException::withMessages([
                'name' => ['İsim veya şifre hatalı.'],
            ]);
        }

        if (! Auth::validate(['email' => $user->email, 'password' => $validated['password']])) {
            throw ValidationException::withMessages([
                'name' => ['İsim veya şifre hatalı.'],
            ]);
        }

        Auth::login($user, $request->boolean('remember'));

        return response()->json([
            'success' => true,
            'user' => $user->toFrontendArray(),
            'csrf_token' => csrf_token(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'csrf_token' => csrf_token(),
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['user' => null]);
        }

        return response()->json(['user' => $user->toFrontendArray()]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:80', 'unique:users,name,'.$user->id],
            'email' => ['sometimes', 'email', 'unique:users,email,'.$user->id],
            'avatar' => ['sometimes', 'string', 'max:500'],
            'total_score' => ['sometimes', 'integer', 'min:0'],
            'sinif_kodu' => ['sometimes', 'nullable', 'string', 'min:4', 'max:20'],
        ]);

        $user->fill(collect($validated)->except('sinif_kodu')->all());
        $user->save();

        if ($user->role === 'ogrenci' && array_key_exists('sinif_kodu', $validated) && $validated['sinif_kodu']) {
            Sinif::joinUser($user, $validated['sinif_kodu']);
        }

        return response()->json([
            'success' => true,
            'user' => $user->fresh()->toFrontendArray(),
        ]);
    }

    public function unlockTennis(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tennis_unlocked = true;
        $user->save();

        return response()->json([
            'success' => true,
            'user' => $user->fresh()->toFrontendArray(),
        ]);
    }
}
