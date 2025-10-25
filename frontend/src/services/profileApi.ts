import axios from 'axios';
import { DoctorProfile, PatientProfile, TimeSlot, Appointment, Review, DoctorRating } from '@/types/user';

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Profile API calls
export const profileAPI = {
  // Doctor Profile
  getDoctorProfile: async (userId: string): Promise<DoctorProfile> => {
    const response = await api.get(`/profiles/doctor/${userId}`);
    return response.data;
  },

  createDoctorProfile: async (data: Omit<DoctorProfile, 'id' | 'status' | 'isProfileComplete'>): Promise<DoctorProfile> => {
    const response = await api.post('/profiles/doctor', data);
    return response.data;
  },

  updateDoctorProfile: async (id: string, data: Partial<DoctorProfile>): Promise<DoctorProfile> => {
    const response = await api.put(`/profiles/doctor/${id}`, data);
    return response.data;
  },

  // Patient Profile
  getPatientProfile: async (userId: string): Promise<PatientProfile> => {
    const response = await api.get(`/profiles/patient/${userId}`);
    return response.data;
  },

  createPatientProfile: async (
    data: Omit<PatientProfile, 'id' | 'isProfileComplete'>
  ): Promise<PatientProfile> => {
    const response = await api.post('/profiles/patient', data);
    return response.data;
  },

  updatePatientProfile: async (id: string, data: Partial<PatientProfile>): Promise<PatientProfile> => {
    const response = await api.put(`/profiles/patient/${id}`, data);
    return response.data;
  },

  // Admin verification functions - Patient
  getPendingPatientProfiles: async (): Promise<PatientProfile[]> => {
    const response = await api.get('/profiles/patient/pending');
    return response.data;
  },

  verifyPatientProfile: async (id: string, isVerified: boolean): Promise<PatientProfile> => {
    const response = await api.patch(`/profiles/patient/${id}/verify`, { isVerified });
    return response.data;
  },

  // Admin verification functions - Doctor
  getPendingDoctorProfiles: async (): Promise<DoctorProfile[]> => {
    const response = await api.get('/profiles/doctor/pending');
    return response.data;
  },

  verifyDoctorProfile: async (id: string, isVerified: boolean): Promise<DoctorProfile> => {
    const response = await api.patch(`/profiles/doctor/${id}/verify`, { isVerified });
    return response.data;
  },

  // File Upload
  uploadDocument: async (file: File, documentType: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await api.post(`/profiles/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // View Document
  getPatientDocument: async (filename: string): Promise<Blob> => {
    const cleanFilename = filename.replace('/uploads/', '');
    const response = await api.get(`/profiles/document/${cleanFilename}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Doctor Time Slots API
export const slotsAPI = {
  createTimeSlots: async (data: {
    doctorId: string;
    date: string;
    timeFrom: string;
    timeTo: string;
    duration: number;
  }): Promise<TimeSlot[]> => {
    const response = await api.post('/slots/generate', data);
    return response.data;
  },

  createMultipleTimeSlots: async (slotsData: Omit<TimeSlot, 'id' | 'isAvailable'>[]): Promise<TimeSlot[]> => {
    // Format data for backend
    const formattedData = slotsData.map(slot => ({
      ...slot,
      date: formatDateForBackend(slot.date),
      doctorId: Number(slot.doctorId)
    }));
    
    console.log('Sending batch to backend:', formattedData);
    
    const response = await api.post('/slots/batch', formattedData);
    return response.data;
  },

  getDoctorSlots: async (doctorId: string): Promise<TimeSlot[]> => {
    const response = await api.get(`/slots/doctor/${doctorId}`);
    return response.data;
  },

  getAvailableSlots: async (doctorId: string, date: string): Promise<TimeSlot[]> => {
    const formattedDate = formatDateForBackend(date);
    const response = await api.get(`/slots/available/${doctorId}?date=${formattedDate}`);
    return response.data;
  },

  deleteTimeSlot: async (id: string): Promise<void> => {
    await api.delete(`/slots/${id}`);
  },
  
  checkSlotConflicts: async (doctorId: string, date: string, timeFrom: string, timeTo: string): Promise<{ hasConflict: boolean }> => {
    const formattedDate = formatDateForBackend(date);
    const response = await api.post(`/slots/check-conflict`, {
      doctorId: Number(doctorId),
      date: formattedDate,
      timeFrom,
      timeTo
    });
    return response.data;
  },
};

// Helper function to format date for backend (YYYY-MM-DD)
const formatDateForBackend = (date: string | Date): string => {
  if (typeof date === 'string') {
    return date; // Assume it's already in correct format
  }
  
  // For Date objects, format as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Appointments API
export const appointmentsAPI = {
  bookAppointment: async (data: {
    patientId: string;
    doctorId: string;
    timeSlotId: string;
    notes?: string;
  }): Promise<Appointment> => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  deleteAppointment: async (appointmentId: string): Promise<void> => {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  },

  getPatientAppointments: async (patientId: string): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/patient/${patientId}`);
    return response.data;
  },

  getDoctorAppointments: async (doctorId: string): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/doctor/${doctorId}`);
    return response.data;
  },

  updateAppointmentStatus: async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', notes?: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/status`, { status, notes });
    return response.data;
  },

  getApprovedDoctors: async (): Promise<DoctorProfile[]> => {
    const response = await api.get('/profiles/doctor/approved');
    return response.data;
  },

  // Add this method to get appointment by ID
  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId: string, data: {
    newTimeSlotId: string;
    newDate: string;
    newTimeFrom: string;
    newTimeTo: string;
  }): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${appointmentId}/reschedule`, data);
    return response.data;
  },
};

// Reviews API
export const reviewsAPI = {
  // Create a review for a completed appointment
  createReview: async (data: {
    appointmentId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // Get all reviews by a patient
  getPatientReviews: async (patientId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/patient/${patientId}`);
    return response.data;
  },

  // Get all reviews for a doctor
  getDoctorReviews: async (doctorId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/doctor/${doctorId}`);
    return response.data;
  },

  // Get doctor's average rating and review count
  getDoctorRating: async (doctorId: string): Promise<DoctorRating> => {
    const response = await api.get(`/reviews/doctor/${doctorId}/rating`);
    return response.data;
  },

  // Update an existing review
  updateReview: async (id: string, data: {
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  // Delete a review
  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },

  // Check if patient can review an appointment (appointment must be completed)
  canReviewAppointment: async (appointmentId: string): Promise<{ canReview: boolean, hasReviewed: boolean }> => {
    const response = await api.get(`/reviews/appointment/${appointmentId}/can-review`);
    return response.data;
  },
};