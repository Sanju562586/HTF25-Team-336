package com.healthcare.medVault.dto;

import lombok.Data;
import java.util.List;

@Data
public class PatientMedicalRecordAccessDTO {
    private String appointmentId;
    private String patientId;
    private String patientName;
    private String appointmentDate;
    private Boolean hasBasicAccess;
    private List<DocumentPermissionRequestDTO> documentPermissions;
    // Add medical record fields if needed
    public static class MedicalRecord {
        private BasicDemographicsDTO basicDemographics;
        private List<MedicalHistoryItemDTO> medicalHistory;
        private LifestyleInformationDTO lifestyle;
        private CurrentHealthDataDTO currentHealth;
        private List<HealthDocumentDTO> documents;

        // Getters and setters for all fields
        public BasicDemographicsDTO getBasicDemographics() { return basicDemographics; }
        public void setBasicDemographics(BasicDemographicsDTO basicDemographics) { this.basicDemographics = basicDemographics; }

        public List<MedicalHistoryItemDTO> getMedicalHistory() { return medicalHistory; }
        public void setMedicalHistory(List<MedicalHistoryItemDTO> medicalHistory) { this.medicalHistory = medicalHistory; }

        public LifestyleInformationDTO getLifestyle() { return lifestyle; }
        public void setLifestyle(LifestyleInformationDTO lifestyle) { this.lifestyle = lifestyle; }

        public CurrentHealthDataDTO getCurrentHealth() { return currentHealth; }
        public void setCurrentHealth(CurrentHealthDataDTO currentHealth) { this.currentHealth = currentHealth; }

        public List<HealthDocumentDTO> getDocuments() { return documents; }
        public void setDocuments(List<HealthDocumentDTO> documents) { this.documents = documents; }
    }

    private MedicalRecord medicalRecord;

    public MedicalRecord getMedicalRecord() { return medicalRecord; }
    public void setMedicalRecord(MedicalRecord medicalRecord) { this.medicalRecord = medicalRecord; }
}