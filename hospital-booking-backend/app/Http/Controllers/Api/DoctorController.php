<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoctorProfile;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * Display a paginated list of doctors with filtering.
     */
    public function index(Request $request)
    {
        $query = DoctorProfile::with(['user:id,name,email,phone', 'department:id,name']);

        // Filter by Department if provided
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Search by Doctor Name
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $doctors = $query->paginate(10);

        return response()->json($doctors);
    }

    /**
     * Display a specific doctor's profile along with schedules and reviews.
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
}
