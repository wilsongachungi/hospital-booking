<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoctorProfile;
use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new Patient.
     */
    public function registerPatient(Request $request)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'email'             => 'required|string|email|max:255|unique:users',
            'phone'             => 'required|string|max:20|unique:users',
            'password'          => 'required|string|min:8',
            'date_of_birth'     => 'nullable|date',
            'gender'            => 'nullable|in:male,female,other',
            'blood_group'       => 'nullable|string|max:5',
            'emergency_contact' => 'nullable|string|max:20',
        ]);

        $result = DB::transaction(function () use ($validated) { //if anything fails the rollback happens to prevent having the orphaned data
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'phone'    => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role'     => 'patient',
            ]);

            $user->patientProfile()->create([
                'date_of_birth'     => $validated['date_of_birth'] ?? null,
                'gender'            => $validated['gender'] ?? null,
                'blood_group'       => $validated['blood_group'] ?? null,
                'emergency_contact' => $validated['emergency_contact'] ?? null,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return ['user' => $user->load('patientProfile'), 'token' => $token];
        });

        return response()->json([
            'message'      => 'Patient registered successfully',
            'user'         => $result['user'],
            'access_token' => $result['token'],
            'token_type'   => 'Bearer',
        ], 201);
    }

    /**
     * Register a new Doctor.
     */
    public function registerDoctor(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|string|email|max:255|unique:users',
            'phone'            => 'required|string|max:20|unique:users',
            'password'         => 'required|string|min:8',
            'department_id'    => 'required|exists:departments,id',
            'qualification'    => 'required|string|max:255',
            'experience_years' => 'required|integer|min:0',
            'consultation_fee' => 'required|numeric|min:0',
            'bio'              => 'nullable|string',
        ]);

        $result = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'phone'    => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role'     => 'doctor',
            ]);

            $user->doctorProfile()->create([
                'department_id'    => $validated['department_id'],
                'qualification'    => $validated['qualification'],
                'experience_years' => $validated['experience_years'],
                'consultation_fee' => $validated['consultation_fee'],
                'bio'              => $validated['bio'] ?? null,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return ['user' => $user->load('doctorProfile'), 'token' => $token];
        });

        return response()->json([
            'message'      => 'Doctor registered successfully',
            'user'         => $result['user'],
            'access_token' => $result['token'],
            'token_type'   => 'Bearer',
        ], 201);
    }

    public function users(Request $request)
    {
        $query = User::select('id', 'name', 'email', 'phone', 'role', 'created_at');

        // Optional role filtering
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->get();

        return response()->json($users);
    }

    /**
     * Login User (Email or Phone).
     */
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string', // Accepts email or phone
            'password' => 'required|string',
        ]);

        $loginType = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($loginType, $request->login)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid credentials provided.'],
            ]);
        }

        // Load profile based on user role
        if ($user->role === 'doctor') {
            $user->load('doctorProfile.department');
        } elseif ($user->role === 'patient') {
            $user->load('patientProfile');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Login successful',
            'user'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    /**
     * Get Authenticated User Details.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'doctor') {
            $user->load('doctorProfile.department');
        } elseif ($user->role === 'patient') {
            $user->load('patientProfile');
        }

        return response()->json($user);
    }

    /**
     * Logout User (Revoke Token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
