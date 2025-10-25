import api from './api';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  specialization: string[];
  department: string;
  yearsOfExperience: number;
  licenseNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PatientsResponse {
  patients: Patient[];
  pagination: PaginationMeta;
}

export interface DoctorsResponse {
  doctors: Doctor[];
  pagination: PaginationMeta;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const adminAPI = {
  // Patient management
  getPatients: async (params: SearchParams = {}): Promise<PatientsResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search })
    });

    const response = await api.get(`/admin/patients?${queryParams}`);
    return response.data;
  },

  removePatient: async (patientId: string): Promise<void> => {
    await api.delete(`/admin/patients/${patientId}`);
  },

  // Doctor management
  getDoctors: async (params: SearchParams = {}): Promise<DoctorsResponse> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      ...(params.search && { search: params.search })
    });

    const response = await api.get(`/admin/doctors?${queryParams}`);
    return response.data;
  },

  removeDoctor: async (doctorId: string): Promise<void> => {
    await api.delete(`/admin/doctors/${doctorId}`);
  },
};