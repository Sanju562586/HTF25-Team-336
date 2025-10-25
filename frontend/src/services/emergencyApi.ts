import api from './api';
import { EmergencyRequest, CreateEmergencyRequest, DoctorAvailability, EmergencyStats } from 'src/types/emergency';

export const emergencyAPI = {
  // Patient Emergency Requests
  createEmergencyRequest: async (data: CreateEmergencyRequest): Promise<EmergencyRequest> => {
    const response = await api.post('/emergency/request', data);
    return response.data;
  },

  getPatientEmergencyRequests: async (patientId: string): Promise<EmergencyRequest[]> => {
    const response = await api.get(`/emergency/patient/${patientId}`);
    return response.data;
  },

  cancelEmergencyRequest: async (requestId: string): Promise<void> => {
    await api.delete(`/emergency/request/${requestId}`);
  },

  // Doctor Emergency Management
  getAvailableDoctors: async (): Promise<DoctorAvailability[]> => {
    const response = await api.get('/emergency/doctors/available');
    return response.data;
  },

  getDoctorAvailability: async (doctorId: string): Promise<boolean> => {
    const response = await api.get(`/emergency/doctor/${doctorId}/availability`);
    return response.data.available;
  },

  updateDoctorAvailability: async (doctorId: string, isAvailable: boolean): Promise<void> => {
    await api.patch(`/emergency/doctor/${doctorId}/availability`, { isAvailable });
  },

  getPendingEmergencyRequests: async (doctorId: string): Promise<EmergencyRequest[]> => {
    const response = await api.get(`/emergency/doctor/${doctorId}/requests/pending`);
    return response.data;
  },

  getDoctorEmergencyRequests: async (doctorId: string): Promise<EmergencyRequest[]> => {
    const response = await api.get(`/emergency/doctor/${doctorId}/requests`);
    return response.data;
  },

  acceptEmergencyRequest: async (doctorId: string, requestId: string): Promise<EmergencyRequest> => {
    const response = await api.patch(`/emergency/doctor/${doctorId}/request/${requestId}/accept`);
    return response.data;
  },

  rejectEmergencyRequest: async (doctorId: string, requestId: string, reason?: string): Promise<void> => {
    await api.patch(`/emergency/doctor/${doctorId}/request/${requestId}/reject`, { reason });
  },

  completeEmergencyRequest: async (requestId: string, notes?: string): Promise<EmergencyRequest> => {
    const response = await api.patch(`/emergency/request/${requestId}/complete`, { notes });
    return response.data;
  },

  // Statistics
  getEmergencyStats: async (): Promise<EmergencyStats> => {
    const response = await api.get('/emergency/stats');
    return response.data;
  },

};