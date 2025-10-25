import { isPromise } from "util/types";

export interface User {
  username: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  first_login: boolean;
  message: string;
  isProfileComplete: boolean;
}

export interface DoctorProfile {
  id: string;
  user: User;
  userId: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  contactNumber: string;
  address: string;
  latitude?: number;
  longitude?: number;
  specialization: string[];
  department: string;
  yearsOfExperience: number;
  consultationFees?: number;
  languagesSpoken: string[];
  medicalDegreeUrl?: string;
  licenseNumber: string;
  governmentIdNumber: string;
  governmentIdUrl?: string;
  affiliationProofUrl?: string;
  isProfileComplete: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PatientProfile {
  id: string;
  user: User;
  userId: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  contactNumber: string;
  address: string;
  latitude?: number;
  longitude?: number;
  emergencyContact?: string;
  governmentIdNumber: string;
  governmentIdUrl?: string;
  isProfileComplete?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  isAvailable: boolean;
  duration?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  timeSlotId: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  doctorName: string;
  patientName: string;
  specialization: string;
  notes?: string; // Add notes field
  createdAt?: string; // Add timestamps
  updatedAt?: string;
  rescheduleCount?: number; // Track how many times it's been rescheduled
  isRescheduled?: boolean; // Track if appointment has been rescheduled
}

export interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  rating: number; // 1-5 stars
  comment?: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DoctorRating {
  doctorId: string;
  averageRating: number;
  totalReviews: number;
}