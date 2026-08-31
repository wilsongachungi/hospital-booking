<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoctorProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DoctorController extends Controller
{
    /**
     * Display a paginated list of doctors with filtering.
     */

public function index(Request $request)
{
    $query = DoctorProfile::with(['user:id,name,email,phone', 'department:id,name']);

    // Filter by Department if provided
    if ($request->has('department_id') && $request->department_id) {
        $query->where('department_id', $request->department_id);
    }

    // Search by Doctor Name
    if ($request->has('search') && $request->search) {
        $search = $request->search;
        $query->whereHas('user', function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%");
        });
    }

    $doctors = $query->latest()->get(); // Use get() or return paginated data structure cleanly

    return response()->json([
        'data' => $doctors
    ]);
}

    /**
     * Store a newly created Doctor Profile.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|string|email|max:255|unique:users',
            'phone'            => 'required|string|max:20|unique:users',
            'password'         => 'required|string|min:8',
            'department_id'    => 'nullable|exists:departments,id',
            'specialization'   => 'nullable|string|max:255',
            'qualification'    => 'required|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'consultation_fee' => 'required|numeric|min:0',
            'bio'              => 'nullable|string',
            'photo_url'        => 'nullable|url|string',
        ]);

        $doctor = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'phone'    => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role'     => 'doctor',
            ]);

            return $user->doctorProfile()->create([
                'department_id'    => $validated['department_id'] ?? null,
                'specialization'   => $validated['specialization'] ?? null,
                'qualification'    => $validated['qualification'],
                'experience_years' => $validated['experience_years'] ?? 0,
                'consultation_fee' => $validated['consultation_fee'],
                'bio'              => $validated['bio'] ?? null,
                'photo_url'        => $validated['photo_url'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Doctor created successfully',
            'data'    => $doctor->load('user', 'department'),
        ], 201);
    }

    /**
     * Display a specific doctor profile.
     */
    public function show(int $id)
    {
        $doctor = DoctorProfile::with([
            'user:id,name,email,phone',
            'department',
            'schedules',
            'reviews.patientProfile.user:id,name',
        ])->findOrFail($id);

        return response()->json([
            'data' => $doctor,
        ]);
    }

    /**
     * Update an existing Doctor Profile.
     */
    public function update(Request $request, int $id)
    {
        $doctor = DoctorProfile::findOrFail($id);

        $validated = $request->validate([
            'specialization'   => 'nullable|string|max:255',
            'qualification'    => 'sometimes|required|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'consultation_fee' => 'sometimes|required|numeric|min:0',
            'bio'              => 'nullable|string',
            'photo_url'        => 'nullable|string',
            'department_id'    => 'nullable|exists:departments,id',
        ]);

        $doctor->update($validated);

        return response()->json([
            'message' => 'Doctor profile updated successfully',
            'data'    => $doctor->load('user', 'department'),
        ]);
    }

    /**
     * Remove a doctor profile and associated user record.
     */
    public function destroy(int $id)
    {
        $doctor = DoctorProfile::findOrFail($id);

        DB::transaction(function () use ($doctor) {
            $user = $doctor->user;
            $doctor->delete();
            if ($user) {
                $user->delete();
            }
        });

        return response()->json([
            'message' => 'Doctor deleted successfully',
        ]);
    }
}