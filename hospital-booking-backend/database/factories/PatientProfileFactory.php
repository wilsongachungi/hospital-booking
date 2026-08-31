<?php

namespace Database\Factories;

use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PatientProfile>
 */
class PatientProfileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PatientProfile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'           => User::factory()->patient(),
            'date_of_birth'     => fake()->dateTimeBetween('-65 years', '-18 years')->format('Y-m-d'),
            'gender'            => fake()->randomElement(['male', 'female', 'other']),
            'blood_group'       => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'address'           => fake()->address(),
            'emergency_contact' => fake()->e164PhoneNumber(),
            'medical_history'   => fake()->optional(0.4)->sentence(10),
        ];
    }
}