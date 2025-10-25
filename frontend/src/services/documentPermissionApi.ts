import axios from "axios";
import {
  DocumentPermissionRequest,
  DocumentPermissionResponse,
  PatientMedicalRecordAccess,
  DoctorDocumentAccess,
} from "@/types/documentPermission";
// import { CurrentHealthData } from "@/types/healthRecord";
import { CurrentHealthData } from "@/types/healthRecord";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const documentPermissionAPI = {
  // Doctor requests permission to view patient documents
  requestDocumentPermission: async (
    appointmentId: string,
    documentId: string,
    requestMessage?: string
  ): Promise<DocumentPermissionRequest> => {
    const response = await api.post("/document-permissions/request", {
      appointmentId,
      documentId,
      requestMessage,
    });
    return response.data;
  },

  // Get patient's medical record with permission status for an appointment
  getPatientMedicalRecord: async (
    appointmentId: string
  ): Promise<PatientMedicalRecordAccess> => {
    const response = await api.get(
      `/medical-records/appointment/${appointmentId}`
    );
    return response.data;
  },

  // Patient responds to document permission request
  respondToPermissionRequest: async (
    permissionRequestId: string,
    response: DocumentPermissionResponse
  ): Promise<DocumentPermissionRequest> => {
    const apiResponse = await api.post(
      `/document-permissions/${permissionRequestId}/respond`,
      response
    );
    return apiResponse.data;
  },

  // Get all pending permission requests for a patient
  getPatientPermissionRequests: async (
    patientId: string
  ): Promise<DocumentPermissionRequest[]> => {
    const response = await api.get(
      `/document-permissions/patient/${patientId}/requests`
    );
    return response.data;
  },

  // Get doctor's document access for specific appointment
  getDoctorDocumentAccess: async (
    appointmentId: string
  ): Promise<DoctorDocumentAccess[]> => {
    const response = await api.get(
      `/document-permissions/doctor/appointment/${appointmentId}/access`
    );
    return response.data;
  },

  // Revoke document permission (patient can revoke manually)
  revokeDocumentPermission: async (
    permissionRequestId: string
  ): Promise<void> => {
    await api.post(`/document-permissions/${permissionRequestId}/revoke`);
  },

  // Check if doctor can access a specific document
  checkDocumentAccess: async (
    documentId: string,
    appointmentId: string
  ): Promise<DoctorDocumentAccess> => {
    const response = await api.get(
      `/document-permissions/check-access/${documentId}/${appointmentId}`
    );
    return response.data;
  },

  async getDocumentFile(documentId: string) {
    const response = await api.get(`/document-permissions/documents/${documentId}`, {
      responseType: 'blob', // important for binary data
    });
    return response.data;
  },

  // Update patient's current health data (doctor can modify)
  updatePatientCurrentHealth: async (
    patientId: string,
    appointmentId: string,
    healthData: CurrentHealthData
  ): Promise<CurrentHealthData> => {
    const response = await api.put(
      `/medical-records/${patientId}/current-health`,
      {
        ...healthData,
        appointmentId,
        updatedByDoctorId: true,
      }
    );
    return response.data;
  },
};
