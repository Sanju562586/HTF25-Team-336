export type BloodGroup = 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

export type SmokingHabit = 'NEVER' | 'FORMER' | 'OCCASIONAL' | 'REGULAR';

export type AlcoholHabit = 'NEVER' | 'OCCASIONAL' | 'MODERATE' | 'REGULAR';

export type DietaryPreference = 'VEGETARIAN' | 'NON_VEGETARIAN' | 'VEGAN' | 'PESCATARIAN';

export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'ACTIVE' | 'VERY_ACTIVE';

export type MedicalHistoryType = 'ALLERGY' | 'PAST_CONDITION' | 'SURGERY' | 'FAMILY_HISTORY' | 'OTHER';

export type DocumentType = 'LAB_REPORT' | 'PRESCRIPTION' | 'SCAN' | 'VACCINATION_RECORD' | 'INSURANCE' | 'OTHER';

export interface BasicDemographics {
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  contactNumber: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  emergencyContact: string;
  maritalStatus: MaritalStatus;
  occupation: string;
}

export interface IdentificationDetails {
  patientId: string;
  nationalId: string;
  insurancePolicyNumber?: string;
}

export interface MedicalHistoryItem {
  id: string;
  type: MedicalHistoryType;
  title: string;
  description?: string;
  onsetDate?: string;
  severity?: 'LOW' | 'MODERATE' | 'HIGH';
  isActive: boolean;
}

export interface LifestyleInformation {
  smokingHabit: SmokingHabit;
  alcoholHabit: AlcoholHabit;
  dietaryPreferences: DietaryPreference;
  physicalActivityLevel: ActivityLevel;
  sleepHours: number;
  stressLevel: 'LOW' | 'MODERATE' | 'HIGH';
  exerciseFrequency?: string;
  sleepQuality?: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
}

export interface VitalSigns {
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  pulse: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  recordedAt?: string;
}

export interface CurrentMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
}

export interface CurrentHealthData {
  weight: number;
  height: number;
  bmi?: number; // Auto-calculated
  vitals: VitalSigns;
  medications: CurrentMedication[];
  lastUpdated?: string;
}

export interface HealthDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadDate: string;
  size?: number;
  description?: string;
  file?: File; // For uploads
}

export interface ConsentPreferences {
  dataSharingConsent: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  preferredLanguage: string;
  emergencyContactConsent: boolean;
  researchParticipation: boolean;
}

export interface PatientHealthRecord {
  id?: string;
  patientId: string;
  basicDemographics: BasicDemographics;
  identification: IdentificationDetails;
  medicalHistory: MedicalHistoryItem[];
  lifestyle: LifestyleInformation;
  currentHealth: CurrentHealthData;
  documents: HealthDocument[];
  consentPreferences: ConsentPreferences;
  createdAt?: string;
  updatedAt?: string;
  lastAccessedAt?: string;
}

export type HealthRecordSection = 
  | 'basicDemographics'
  | 'identification' 
  | 'medicalHistory'
  | 'lifestyle'
  | 'currentHealth'
  | 'documents'
  | 'consentPreferences';

export interface HealthRecordUpdateRequest {
  section: HealthRecordSection;
  data: Partial<PatientHealthRecord>;
}