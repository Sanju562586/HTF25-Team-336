import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginRequest {
  username: string;
  password: string;
}
export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingVerifications: number; // New field for pending verifications
}

export interface LoginResponse {
  role: UserRole;
  username: string;
  first_login: boolean;
  message: string;
  isProfileComplete: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ResetPasswordRequest {
  username: string;
  newPassword: string;
}

// Auth API calls
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.put('/auth/reset-password', {
      username: data.username,
      newPassword: data.newPassword,
    });
    return response.data;
  },
};

export const analyticsAPI = {
  getUserStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/analytics/user-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalUsers: 1250,
        totalDoctors: 45,
        totalPatients: 1180,
        totalAppointments: 3420,
        pendingVerifications: 0, // Default value
      };
    }
  },

  getAppointmentData: async () => {
    // Mock data for charts
    return [
      { month: 'Jan', appointments: 245 },
      { month: 'Feb', appointments: 378 },
      { month: 'Mar', appointments: 432 },
      { month: 'Apr', appointments: 298 },
      { month: 'May', appointments: 456 },
      { month: 'Jun', appointments: 523 },
    ];
  },

  getPatientsPerDoctor: async () => {
    return [
      { doctor: 'Dr. Smith', patients: 45 },
      { doctor: 'Dr. Johnson', patients: 38 },
      { doctor: 'Dr. Brown', patients: 52 },
      { doctor: 'Dr. Davis', patients: 41 },
      { doctor: 'Dr. Wilson', patients: 36 },
    ];
  },

  getDepartmentDistribution: async () => {
    return [
      { name: 'Cardiology', value: 30, color: '#3B82F6' },
      { name: 'Neurology', value: 25, color: '#10B981' },
      { name: 'Orthopedics', value: 20, color: '#F59E0B' },
      { name: 'Pediatrics', value: 15, color: '#EF4444' },
      { name: 'Others', value: 10, color: '#8B5CF6' },
    ];
  },
};


export default api;