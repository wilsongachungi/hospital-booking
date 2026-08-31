<?php

use App\Models\User;
use App\Models\Department;
use App\Models\DoctorProfile;
use App\Models\PatientProfile;
use App\Models\Appointment;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

test('a patient can initiate an mpesa payment', function () {
    // 1. Mock Daraja OAuth and STK Push HTTP endpoints
    Http::fake([
        '*/oauth/v1/generate*' => Http::response([
            'access_token' => 'mocked_access_token',
            'expires_in' => '3599',
        ], 200),
        '*/mpesa/stkpush/v1/processrequest' => Http::response([
            'MerchantRequestID' => '29115-34620561-1',
            'CheckoutRequestID' => 'ws_CO_28082026024000123',
            'ResponseCode' => '0',
            'ResponseDescription' => 'Success. Request accepted for processing',
            'CustomerMessage' => 'Success. Request accepted for processing',
        ], 200),
    ]);

    // 2. Setup mock data
    $department = Department::create(['name' => 'ENT', 'is_active' => true]);

    $patientUser = User::create([
        'name' => 'Grace Patient',
        'email' => 'grace@gmail.com',
        'phone' => '254712345678',
        'password' => bcrypt('password'),
        'role' => 'patient',
    ]);
    $patientProfile = PatientProfile::create(['user_id' => $patientUser->id]);

    $doctorUser = User::create([
        'name' => 'Dr. Paul',
        'email' => 'paul@hospital.com',
        'phone' => '254798765432',
        'password' => bcrypt('password'),
        'role' => 'doctor',
    ]);
    $doctorProfile = DoctorProfile::create([
        'user_id' => $doctorUser->id,
        'department_id' => $department->id,
        'qualification' => 'MD',
        'experience_years' => 6,
        'consultation_fee' => 500.00,
    ]);

    $appointment = Appointment::create([
        'patient_profile_id' => $patientProfile->id,
        'doctor_profile_id' => $doctorProfile->id,
        'appointment_date' => now()->addDay(),
        'status' => 'pending',
    ]);

    // 3. Make request
    $response = $this->actingAs($patientUser, 'sanctum')
        ->postJson('/api/payments/initiate', [
            'appointment_id' => $appointment->id,
            'phone_number'   => '254712345678',
            'amount'         => 500,
        ]);

    // 4. Assert response
    $response->assertStatus(200)
        ->assertJsonPath('CheckoutRequestID', 'ws_CO_28082026024000123');
});

test('it updates payment and appointment status upon successful mpesa callback', function () {
    // 1. Arrange
    $department = Department::create(['name' => 'Cardiology', 'is_active' => true]);
    $patientUser = User::create([
        'name' => 'Sam Patient',
        'email' => 'sam@gmail.com',
        'phone' => '254711111111',
        'password' => bcrypt('password'),
        'role' => 'patient',
    ]);
    $patientProfile = PatientProfile::create(['user_id' => $patientUser->id]);

    $doctorUser = User::create([
        'name' => 'Dr. Smith',
        'email' => 'smith@hospital.com',
        'phone' => '254722222222',
        'password' => bcrypt('password'),
        'role' => 'doctor',
    ]);
    $doctorProfile = DoctorProfile::create([
        'user_id' => $doctorUser->id,
        'department_id' => $department->id,
        'qualification' => 'MD',
        'experience_years' => 10,
        'consultation_fee' => 1000.00,
    ]);

    $appointment = Appointment::create([
        'patient_profile_id' => $patientProfile->id,
        'doctor_profile_id' => $doctorProfile->id,
        'appointment_date' => now()->addDay(),
        'status' => 'pending',
    ]);

    // Added 'payment_method' => 'mpesa' here:
    $payment = Payment::create([
        'appointment_id' => $appointment->id,
        'checkout_request_id' => 'ws_CO_TEST123456',
        'payment_method' => 'mpesa',
        'amount' => 1000.00,
        'status' => 'pending',
    ]);

    // 2. Mock incoming Safaricom Daraja Webhook Payload
    $payload = [
        'Body' => [
            'stkCallback' => [
                'MerchantRequestID' => '12345-67890-1',
                'CheckoutRequestID' => 'ws_CO_TEST123456',
                'ResultCode' => 0,
                'ResultDesc' => 'The service request is processed successfully.',
                'CallbackMetadata' => [
                    'Item' => [
                        ['Name' => 'Amount', 'Value' => 1000],
                        ['Name' => 'MpesaReceiptNumber', 'Value' => 'QWE123RTY4'],
                        ['Name' => 'PhoneNumber', 'Value' => 254711111111],
                    ],
                ],
            ],
        ],
    ];

    // 3. Act
    $response = $this->postJson('/api/payments/callback', $payload);

    // 4. Assert
    $response->assertStatus(200)
             ->assertJson(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);

    $this->assertDatabaseHas('payments', [
        'id' => $payment->id,
        'status' => 'completed',
        'mpesa_receipt_number' => 'QWE123RTY4',
    ]);

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'status' => 'confirmed',
    ]);
});
