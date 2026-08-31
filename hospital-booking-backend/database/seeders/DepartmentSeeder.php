<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name'        => 'Cardiology',
                'description' => 'Comprehensive heart care, cardiovascular diagnostics, and specialized surgery.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Pediatrics',
                'description' => 'Specialized medical care for infants, children, and adolescents.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Dermatology',
                'description' => 'Advanced treatment for skin, hair, and nail conditions.',
                'is_active'   => true,
            ],
            [
                'name'        => 'ENT (Ear, Nose & Throat)',
                'description' => 'Diagnosis and treatment of ear, nose, throat, head, and neck disorders.',
                'is_active'   => true,
            ],
            [
                'name'        => 'General Medicine',
                'description' => 'Primary care, routine health evaluations, and general medical consultations.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Orthopedics',
                'description' => 'Treatment of bone, joint, ligament, tendon, and muscle conditions.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Obstetrics & Gynecology',
                'description' => 'Womens health, reproductive care, maternity, and prenatal services.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Neurology',
                'description' => 'Specialized care for disorders of the brain, spine, and nervous system.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Ophthalmology',
                'description' => 'Eye examinations, vision care, and surgical eye procedures.',
                'is_active'   => true,
            ],
            [
                'name'        => 'Dental & Oral Surgery',
                'description' => 'Comprehensive dental care, cleaning, restorations, and oral surgeries.',
                'is_active'   => true,
            ],
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(['name' => $dept['name']], $dept);
        }
    }
}