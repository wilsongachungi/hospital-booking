<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\DoctorProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class DoctorProfileSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get 20 existing users (or users already marked as 'doctor')
        $doctorUsers = User::where('role', 'doctor')
            ->take(20)
            ->get();

        // If there aren't 20 users with role='doctor', grab regular users and assign them the doctor role
        if ($doctorUsers->count() < 20) {
            $needed = 20 - $doctorUsers->count();
            
            $assignedUsers = User::where('role', '!=', 'admin')
                ->whereDoesntHave('patientProfile')
                ->whereDoesntHave('doctorProfile')
                ->take($needed)
                ->get();

            foreach ($assignedUsers as $user) {
                $user->update(['role' => 'doctor']);
            }

            $doctorUsers = User::where('role', 'doctor')->take(20)->get();
        }

        // 2. Link each user to a DoctorProfile and assign to a random Department
        $departments = Department::all();

        if ($departments->isEmpty()) {
            $this->command->error('No departments found! Run DepartmentSeeder first.');
            return;
        }

        foreach ($doctorUsers as $user) {
            DoctorProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'department_id'    => $departments->random()->id,
                    'specialization'   => fake()->randomElement([
                        'Consultant Cardiologist',
                        'General Pediatrician',
                        'Dermatology Specialist',
                        'ENT Surgeon',
                        'Orthopedic Surgeon',
                        'Neurologist',
                    ]),
                    'qualification'    => fake()->randomElement(['MBChB, MMed', 'MBBS, MD', 'MBChB']),
                    'consultation_fee' => fake()->randomElement([1500, 2000, 2500, 3000, 5000]),
                    'biography'        => fake()->paragraph(2),
                    'is_available'     => true,
                ]
            );
        }
    }
}