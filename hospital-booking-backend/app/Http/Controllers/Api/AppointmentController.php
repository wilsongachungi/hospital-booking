<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * List appointments for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Appointment::with(['doctorProfile.user', 'patientProfile.user', 'payment']);

        if ($user->role === 'patient') {
            $query->where('patient_profile_id', $user->patientProfile->id);
        } elseif ($user->role === 'doctor') {
            $query->where('doctor_profile_id', $user->doctorProfile->id);
        }

        return response()->json($query->latest()->paginate(10));
    }

    /**
     * Book a new appointment.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'patient') {
            return response()->json(['message' => 'Only patients can book appointments.'], 403);
        }

        $validated = $request->validate([
            'doctor_profile_id' => 'required|exists:doctor_profiles,id',
            'appointment_date' => 'required|date|after:now',
            'symptoms_notes' => 'nullable|string|max:1000',
        ]);

        $appointment = Appointment::create([
            'patient_profile_id' => $user->patientProfile->id,
            'doctor_profile_id' => $validated['doctor_profile_id'],
            'appointment_date' => $validated['appointment_date'],
            'symptoms_notes' => $validated['symptoms_notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Appointment requested successfully.',
            'appointment' => $appointment->load('doctorProfile.user'),
        ], 201);
    }

    /**
     * Display specific appointment details.
     */
    public function show(Request $request, int $id)
    {
        $appointment = Appointment::with(['doctorProfile.user', 'patientProfile.user', 'payment'])
            ->findOrFail($id);

        $user = $request->user();

        if ($user->role === 'patient' && $appointment->patient_profile_id !== $user->patientProfile->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        if ($user->role === 'doctor' && $appointment->doctor_profile_id !== $user->doctorProfile->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        return response()->json($appointment);
    }

    /**
     * Cancel an appointment.
     */
    public function cancel(Request $request, int $id)
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        if ($user->role === 'patient' && $appointment->patient_profile_id !== $user->patientProfile->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Appointment cancelled successfully.',
            'appointment' => $appointment,
        ]);
    }
}
