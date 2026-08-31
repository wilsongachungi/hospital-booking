<?php

namespace Database\Seeders;

use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Departments First
        $this->call([
            DepartmentSeeder::class,
        ]);

        // 2. Default Test Admin Account
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name'     => 'System Admin',
                'phone'    => '+254700000000',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]
        );

        // 3. Default Test Patient Account
        $testPatient = User::updateOrCreate(
            ['email' => 'patient@gmail.com'],
            [
                'name'     => 'Sam Patient',
                'phone'    => '+254711111111',
                'password' => Hash::make('password'),
                'role'     => 'patient',
            ]
        );

        PatientProfile::updateOrCreate(
            ['user_id' => $testPatient->id],
            [
                'date_of_birth'     => '1995-06-15',
                'gender'            => 'male',
                'blood_group'       => 'O+',
                'address'           => 'Nairobi, Kenya',
                'emergency_contact' => '+254722222222',
                'medical_history'   => 'No prior surgeries.',
            ]
        );

        // 4. Generate 20 Random Doctor Users
        User::factory(20)->create([
            'role' => 'doctor',
        ]);

        // 5. Seed Doctor Profiles (links the doctor users to departments)
        $this->call([
            DoctorProfileSeeder::class,
        ]);

        // 6. Generate 200 Random Fake Patient Users with Profiles
        User::factory(200)
            ->patient()
            ->create()
            ->each(function ($user) {
                PatientProfile::factory()->create([
                    'user_id' => $user->id,
                ]);
            });
    }
}