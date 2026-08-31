// --- Existing Types ---
export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at?: string;
}

export interface PatientProfile {
  id: number;
  user_id: number;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  user?: User; // Nested relation
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
}

// --- Added Types ---
export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface DoctorProfile {
  id: number;
  user_id: number;
  department_id: number;
  specialization: string;
  qualification: string;
  consultation_fee: number;
  is_available: boolean;
  department?: Department;
  bio?: string;
  biography?: string;
  photo_url?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

export interface Appointment {
  id: number;
  
  // Database Foreign Keys
  patient_profile_id: number;
  doctor_profile_id: number;
  
  // Legacy / Fallback Foreign Keys
  patient_id?: number;
  doctor_id?: number;

  // Date & Notes
  appointment_date: string;
  appointment_time?: string;
  time?: string;
  symptoms_notes?: string;
  notes?: string;

  // Status values matching Laravel validation ('pending', 'scheduled', 'completed', 'cancelled')
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';

  created_at?: string;
  updated_at?: string;

  // Laravel Relations (matches Appointment::with(['doctorProfile.user', 'patientProfile.user']))
  patient_profile?: PatientProfile;
  doctor_profile?: DoctorProfile;
  
  // Legacy / Fallback Relations
  patient?: PatientProfile;
  doctor?: DoctorProfile;
}