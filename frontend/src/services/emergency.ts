export interface EmergencyRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  symptoms: string;
  urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  acceptedBy?: string;
  doctorId?: string;
  doctorName?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface CreateEmergencyRequest {
  patientId: string;
  symptoms: string;
  urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  notes?: string;
}

export interface DoctorAvailability {
  doctorId: string;
  doctorName: string;
  specialization: string;
  isAvailable: boolean;
  currentLocation?: string;
}

export interface EmergencyStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  completedRequests: number;
  averageResponseTime: number; // in minutes
}