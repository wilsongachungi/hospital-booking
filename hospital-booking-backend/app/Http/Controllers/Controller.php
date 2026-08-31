<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PatientProfileController extends Controller
{
    /**
     * Get the authenticated user's profile and patient details.
     */
    public function show(Request $request)
    {
        // Load the linked patient profile if available
        $user = $request->user()->load('patientProfile');

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * Update profile details (Name, Phone, Address, Medical History, etc.).
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'phone'           => 'nullable|string|max:20|unique:users,phone,' . $user->id,
            'date_of_birth'   => 'nullable|date',
            'gender'          => 'nullable|in:male,female,other',
            'address'         => 'nullable|string|max:500',
            'medical_history' => 'nullable|string',
        ]);

        // Update core user attributes
        $user->update([
            'name'  => $validated['name'],
            'phone' => $validated['phone'] ?? $user->phone,
        ]);

        // Update or create linked patient profile details
        $user->patientProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'date_of_birth'   => $validated['date_of_birth'] ?? null,
                'gender'          => $validated['gender'] ?? null,
                'address'         => $validated['address'] ?? null,
                'medical_history' => $validated['medical_history'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Profile updated successfully',
            'data'    => $user->fresh('patientProfile'),
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        // Verify existing password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The provided current password does not match our records.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    /**
     * Permanently delete user account and invalidate active tokens.
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        // Confirm password before irreversible deletion
        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Incorrect password. Account deletion aborted.',
            ], 422);
        }

        // Revoke Sanctum tokens & delete user record (cascades profile via DB foreign key)
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Your account has been permanently deleted.',
        ]);
    }
}