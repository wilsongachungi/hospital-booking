<?php

use App\Models\User;
use App\Models\Department;
use App\Models\DoctorProfile;
use App\Models\PatientProfile;
use App\Models\Appointment;

test('a patient can create an appointment', function () {
  // 1. Setup mock data
  $department = Department::create(['name' => 'Cardiology', 'is_active' => true]);

  $doctorUser = User::create([
    'name' => 'Dr. Smith',
    'email' => 'smith@hospital.com',
    'phone' => '0711111111',
    'password' => bcrypt('password123'),
    'role' => 'doctor',
  ]);

  $doctorProfile = DoctorProfile::create([
    'user_id' => $doctorUser->id,
    'department_id' => $department->id,
    'qualification' => 'MD',
    'experience_years' => 5,
    'consultation_fee' => 500.00,
  ]);

  $patientUser = User::create([
    'name' => 'John Doe',
    'email' => 'john@gmail.com',
    'phone' => '0722222222',
    'password' => bcrypt('password123'),
    'role' => 'patient',
  ]);

  $patientProfile = PatientProfile::create([
    'user_id' => $patientUser->id,
  ]);

  // 2. Make request
  $payload = [
    'doctor_profile_id' => $doctorProfile->id,
    'appointment_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
    'symptoms_notes' => 'Experiencing mild chest tightness.',
  ];

  $response = $this->actingAs($patientUser, 'sanctum')
    ->postJson('/api/appointments', $payload);

  // 3. Assertions
  $response->assertStatus(201)
    ->assertJsonStructure([
      'message',
      'appointment' => ['id', 'patient_profile_id', 'doctor_profile_id', 'status'],
    ]);

  $this->assertDatabaseHas('appointments', [
    'patient_profile_id' => $patientProfile->id,
    'doctor_profile_id' => $doctorProfile->id,
    'status' => 'pending',
  ]);
});

test('unauthenticated users cannot book appointments', function () {
  $response = $this->postJson('/api/appointments', []);
  $response->assertStatus(401);
});

test('a patient can list their own appointments', function () {
  // 1. Arrange
  $department = Department::create(['name' => 'Pediatrics', 'is_active' => true]);

  $patientUser = User::create([
    'name' => 'Jane Patient',
    'email' => 'jane@gmail.com',
    'phone' => '0733333333',
    'password' => bcrypt('password'),
    'role' => 'patient',
  ]);
  $patientProfile = PatientProfile::create(['user_id' => $patientUser->id]);

  $doctorUser = User::create([
    'name' => 'Dr. Adams',
    'email' => 'adams@hospital.com',
    'phone' => '0744444444',
    'password' => bcrypt('password'),
    'role' => 'doctor',
  ]);
  $doctorProfile = DoctorProfile::create([
    'user_id' => $doctorUser->id,
    'department_id' => $department->id,
    'qualification' => 'MBBS',
    'experience_years' => 8,
    'consultation_fee' => 1000.00,
  ]);

  // Create 2 appointments in database for this patient
  Appointment::create([
    'patient_profile_id' => $patientProfile->id,
    'doctor_profile_id' => $doctorProfile->id,
    'appointment_date' => now()->addDay(),
    'status' => 'pending',
  ]);

  // 2. Act
  $response = $this->actingAs($patientUser, 'sanctum')
    ->getJson('/api/appointments');

  // 3. Assert
  $response->assertStatus(200)
    ->assertJsonCount(1, 'data');
});

test('a patient can cancel an appointment', function () {
  // 1. Arrange
  $department = Department::create(['name' => 'Dermatology', 'is_active' => true]);

  $patientUser = User::create([
    'name' => 'Alex Patient',
    'email' => 'alex@gmail.com',
    'phone' => '0755555555',
    'password' => bcrypt('password'),
    'role' => 'patient',
  ]);
  $patientProfile = PatientProfile::create(['user_id' => $patientUser->id]);

  $doctorUser = User::create([
    'name' => 'Dr. House',
    'email' => 'house@hospital.com',
    'phone' => '0766666666',
    'password' => bcrypt('password'),
    'role' => 'doctor',
  ]);
  $doctorProfile = DoctorProfile::create([
    'user_id' => $doctorUser->id,
    'department_id' => $department->id,
    'qualification' => 'MD',
    'experience_years' => 12,
    'consultation_fee' => 1500.00,
  ]);

  $appointment = Appointment::create([
    'patient_profile_id' => $patientProfile->id,
    'doctor_profile_id' => $doctorProfile->id,
    'appointment_date' => now()->addDays(3),
    'status' => 'pending',
  ]);

  // 2. Act
  $response = $this->actingAs($patientUser, 'sanctum')
    ->patchJson("/api/appointments/{$appointment->id}/cancel");

  // 3. Assert
  $response->assertStatus(200)
    ->assertJsonPath('appointment.status', 'cancelled');

  $this->assertDatabaseHas('appointments', [
    'id' => $appointment->id,
    'status' => 'cancelled',
  ]);
});
