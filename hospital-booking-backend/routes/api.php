<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PatientProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'registerPatient']); // Simplified name
Route::post('/login', [AuthController::class, 'login']);

Route::get('/departments', [DepartmentController::class, 'index']);
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Admin endpoint to provision doctors
    Route::post('/admin/doctors', [AuthController::class, 'registerDoctor']);
    Route::get('/admin/users', [AuthController::class, 'users']);
    Route::get('/admin/departments', [DepartmentController::class, 'index']);

    // Appointments & Payments
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::patch('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);

    Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
    Route::get('/payments/{id}/status', [PaymentController::class, 'status']);

    Route::get('/user/profile', [PatientProfileController::class, 'show']);
    Route::put('/user/profile', [PatientProfileController::class, 'update']);
    Route::put('/user/change-password', [PatientProfileController::class, 'changePassword']);
    Route::delete('/user/account', [PatientProfileController::class, 'destroy']);
});
