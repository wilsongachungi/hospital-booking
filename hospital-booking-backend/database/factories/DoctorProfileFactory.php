<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\DoctorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DoctorProfile>
 */
class DoctorProfileFactory extends Factory
{
    protected $model = DoctorProfile::class;

    public function definition(): array
    {
        return [
            'user_id'          => User::factory()->doctor(),
            'department_id'    => Department::inRandomOrder()->first()?->id ?? Department::factory(),
            'specialization'   => fake()->randomElement([
                'Consultant Cardiologist',
                'General Pediatrician',
                'Dermatology Specialist',
                'ENT Surgeon',
                'Orthopedic Surgeon',
                'Neurologist',
                'Obstetrician & Gynecologist',
            ]),
            'qualification'    => fake()->randomElement(['MBChB, MMed', 'MBBS, MD', 'MBChB, FWACS']),
            'consultation_fee' => fake()->randomElement([1500, 2000, 2500, 3000, 5000]),
            'biography'        => fake()->paragraph(3),
            'is_available'     => true,
        ];
    }
}