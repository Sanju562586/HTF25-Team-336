import type {
  BasicDemographics,
  MedicalHistoryItem,
  LifestyleInformation,
  CurrentHealthData,
  HealthDocument,
} from "./healthRecord";

export interface DocumentPermissionRequest {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  documentId: string;
  documentName: string;
  documentType: string;
  requestMessage?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  respondedAt?: string;
  expiresAt?: string; // For approved requests - 12 hours from approval
  isExpired: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentPermissionResponse {
  permissionRequestId: string;
  response: "APPROVED" | "REJECTED";
  responseMessage?: string;
}

export interface PatientMedicalRecordAccess {
  appointmentId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  hasBasicAccess: boolean;
  documentPermissions: DocumentPermissionRequest[];
  medicalRecord?: {
    basicDemographics: BasicDemographics;
    medicalHistory: MedicalHistoryItem[];
    lifestyle: LifestyleInformation;
    currentHealth: CurrentHealthData;
    documents: HealthDocument[];
  };
}


export interface DoctorDocumentAccess {
  documentId: string;
  permissionId: string;
  canView: boolean;
  expiresAt?: string;
  timeRemaining?: number; // in minutes
}
