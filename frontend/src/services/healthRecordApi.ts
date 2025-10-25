import axios from 'axios';
import { PatientHealthRecord, HealthRecordUpdateRequest, MedicalHistoryItem, CurrentMedication, HealthDocument, HealthRecordSection } from '@/types/healthRecord';

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const healthRecordAPI = {
  // Get patient's complete health record
  getHealthRecord: async (patientId: string): Promise<PatientHealthRecord> => {
    const response = await api.get(`/health-records/${patientId}`);
    return response.data;
  },

  // Create initial health record
  createHealthRecord: async (data: Omit<PatientHealthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientHealthRecord> => {
    const response = await api.post('/health-records', data);
    return response.data;
  },

  // Update specific section of health record
  updateHealthRecordSection: async (patientId: string, section: HealthRecordSection, data): Promise<PatientHealthRecord> => {
    const response = await api.patch(`/health-records/${patientId}/section/${section}`, data);
    return response.data;
  },

  // Update basic demographics
  updateBasicDemographics: async (patientId: string, data: PatientHealthRecord['basicDemographics']): Promise<PatientHealthRecord> => {
    const response = await api.patch(`/health-records/${patientId}/demographics`, data);
    return response.data;
  },

  // Update identification details
  updateIdentification: async (patientId: string, data: PatientHealthRecord['identification']): Promise<PatientHealthRecord> => {
    const response = await api.patch(`/health-records/${patientId}/identification`, data);
    return response.data;
  },

  // Medical History Management
  addMedicalHistoryItem: async (patientId: string, item: Omit<MedicalHistoryItem, 'id'>): Promise<MedicalHistoryItem> => {
    const response = await api.post(`/health-records/${patientId}/medical-history`, item);
    return response.data;
  },

  updateMedicalHistoryItem: async (patientId: string, itemId: string, item: Partial<MedicalHistoryItem>): Promise<MedicalHistoryItem> => {
    const response = await api.put(`/health-records/${patientId}/medical-history/${itemId}`, item);
    return response.data;
  },

  deleteMedicalHistoryItem: async (patientId: string, itemId: string): Promise<void> => {
    await api.delete(`/health-records/${patientId}/medical-history/${itemId}`);
  },

  // Lifestyle Information
  updateLifestyle: async (patientId: string, data: PatientHealthRecord['lifestyle']): Promise<PatientHealthRecord> => {
    const response = await api.patch(`/health-records/${patientId}/lifestyle`, data);
    return response.data;
  },

  // Current Health Data
  updateCurrentHealth: async (patientId: string, data: PatientHealthRecord['currentHealth']): Promise<PatientHealthRecord> => {
    const response = await api.patch(`/health-records/${patientId}/current-health`, data);
    return response.data;
  },

  // Medications Management
  addMedication: async (patientId: string, medication: Omit<CurrentMedication, 'id'>): Promise<CurrentMedication> => {
    const response = await api.post(`/health-records/${patientId}/medications`, medication);
    return response.data;
  },

  updateMedication: async (patientId: string, medicationId: string, medication: Partial<CurrentMedication>): Promise<CurrentMedication> => {
    const response = await api.put(`/health-records/${patientId}/medications/${medicationId}`, medication);
    return response.data;
  },

  deleteMedication: async (patientId: string, medicationId: string): Promise<void> => {
    await api.delete(`/health-records/${patientId}/medications/${medicationId}`);
  },

  // Document Management
  // In healthRecordApi.ts, ensure you have:

  getDocumentUrl: (fileName: string): string => {
    return `${api.defaults.baseURL}/health-documents/download/${fileName}`;
  },

  getDocuments: async (patientId: string): Promise<HealthDocument[]> => {
    const response = await api.get(`/health-documents/${patientId}`);
    return response.data;
  },

  uploadDocument: async (
    patientId: string, 
    file: File, 
    documentType: string, 
    description?: string
  ): Promise<HealthDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (description) {
      formData.append('description', description);
    }

    const response = await api.post(`/health-documents/${patientId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (documentId: number): Promise<void> => {
    await api.delete(`/health-documents/${documentId}`);
  },

  updateDocument: async (documentId: number, data: Partial<HealthDocument>): Promise<HealthDocument> => {
    const response = await api.put(`/health-documents/${documentId}`, data);
    return response.data;
  },

  downloadDocument: async (fileName: string): Promise<Blob> => {
    const response = await api.get(`/health-documents/download/${fileName}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Consent & Preferences
  updateConsentPreferences: async (patientId: string, data: PatientHealthRecord['consentPreferences']): Promise<PatientHealthRecord> => {
    const response = await api.patch(`/health-records/${patientId}/consent`, data);
    return response.data;
  },

  // Bulk operations
  bulkUpdateHealthRecord: async (patientId: string, updates: HealthRecordUpdateRequest[]): Promise<PatientHealthRecord> => {
    const response = await api.patch(`/health-records/${patientId}/bulk-update`, { updates });
    return response.data;
  },

  // Health record summary for dashboard
  getHealthRecordSummary: async (patientId: string): Promise<{
    completionPercentage: number;
    lastUpdated: string;
    activeMedications: number;
    upcomingReminders: number;
  }> => {
    const response = await api.get(`/health-records/${patientId}/summary`);
    return response.data;
  },
};