// PatientHealthRecordDTO.java
package com.healthcare.medVault.dto;

import lombok.Data;

import java.util.List;

@Data
public class PatientHealthRecordDTO {
    private String id;
    private String patientId;
    private BasicDemographicsDTO basicDemographics;
    private IdentificationDetailsDTO identification;
    private List<MedicalHistoryItemDTO> medicalHistory;
    private LifestyleInformationDTO lifestyle;
    private CurrentHealthDataDTO currentHealth;
    private List<HealthDocumentDTO> documents;
    private ConsentPreferencesDTO consentPreferences;
    private String createdAt;
    private String updatedAt;
    private String lastAccessedAt;
}