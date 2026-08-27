<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;

class DepartmentController extends Controller
{
  /**
     * Display a listing of active departments with active doctors.
     */
    public function index()
    {
        $departments = Department::where('is_active', true)
            ->withCount(['doctors' => function ($query) {
                $query->whereHas('user');
            }])
            ->get();

        return response()->json([
            'data' => $departments,
        ]);
    }
}
