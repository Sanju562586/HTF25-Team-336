// PatientHealthRecordServiceImpl.java
package com.healthcare.medVault.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.PatientHealthRecord;
import com.healthcare.medVault.repository.PatientHealthRecordRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientHealthRecordServiceImpl implements PatientHealthRecordService{

    private final PatientHealthRecordRepository repository;

    private final ObjectMapper objectMapper;

    public Optional<PatientHealthRecordDTO> getHealthRecord(String patientId) {
        return repository.findByPatientId(patientId)
                .map(this::convertToDTO);
    }

    @Transactional
    public PatientHealthRecordDTO createHealthRecord(PatientHealthRecordDTO dto) {
        PatientHealthRecord record = convertToEntity(dto);
        record = repository.save(record);
        return convertToDTO(record);
    }

    @Transactional
    public PatientHealthRecordDTO updateHealthRecordSection(String patientId, String section, Object data) {
        PatientHealthRecord record = repository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Health record not found for patient: " + patientId));

        try {
            extracted(section, data, record);

            record.setUpdatedAt(LocalDateTime.now());
            record = repository.save(record);
            return convertToDTO(record);

        } catch (Exception e) {
            throw new RuntimeException("Error updating health record section", e);
        }
    }

    private void extracted(String section, Object data, PatientHealthRecord record) throws JsonProcessingException {
        switch (section) {
            case "basicDemographics":
                record.setBasicDemographics(objectMapper.writeValueAsString(data));
                break;
            case "identification":
                record.setIdentificationDetails(objectMapper.writeValueAsString(data));
                break;
            case "medicalHistory":
                record.setMedicalHistory(objectMapper.writeValueAsString(data));
                break;
            case "lifestyle":
                record.setLifestyleInfo(objectMapper.writeValueAsString(data));
                break;
            case "currentHealth":
                record.setCurrentHealth(objectMapper.writeValueAsString(data));
                break;
            case "documents": // ADDED: Support for documents section
                record.setDocuments(objectMapper.writeValueAsString(data));
                break;
            case "consentPreferences":
                record.setConsentPreferences(objectMapper.writeValueAsString(data));
                break;
            default:
                throw new RuntimeException("Invalid section: " + section);
        }
    }

    @Transactional
    public void deleteHealthRecord(String patientId) {
        repository.deleteByPatientId(patientId);
    }

    public HealthRecordSummaryDTO getHealthRecordSummary(String patientId) {
        Optional<PatientHealthRecord> recordOpt = repository.findByPatientId(patientId);

        HealthRecordSummaryDTO summary = new HealthRecordSummaryDTO();
        summary.setCompletionPercentage(calculateCompletionPercentage(recordOpt.orElse(null)));
        summary.setLastUpdated(recordOpt.map(r -> r.getUpdatedAt().toString()).orElse(null));
        summary.setActiveMedications(0); // You'll need to implement this based on medications
        summary.setUpcomingReminders(0); // You'll need to implement this

        return summary;
    }

    private int calculateCompletionPercentage(PatientHealthRecord record) {
        if (record == null) return 0;

        int completedSections = 0;
        int totalSections = 7; // UPDATED: Changed from 6 to 7 to include documents

        try {
            if (record.getBasicDemographics() != null && !record.getBasicDemographics().isEmpty()) completedSections++;
            if (record.getIdentificationDetails() != null && !record.getIdentificationDetails().isEmpty()) completedSections++;
            if (record.getMedicalHistory() != null && !record.getMedicalHistory().isEmpty()) completedSections++;
            if (record.getLifestyleInfo() != null && !record.getLifestyleInfo().isEmpty()) completedSections++;
            if (record.getCurrentHealth() != null && !record.getCurrentHealth().isEmpty()) completedSections++;
            if (record.getDocuments() != null && !record.getDocuments().isEmpty()) completedSections++; // ADDED: Check documents
            if (record.getConsentPreferences() != null && !record.getConsentPreferences().isEmpty()) completedSections++;
        } catch (Exception e) {
            // Handle exception
        }

        return (completedSections * 100) / totalSections;
    }

    private PatientHealthRecord convertToEntity(PatientHealthRecordDTO dto) {
        PatientHealthRecord entity = new PatientHealthRecord();
        entity.setPatientId(dto.getPatientId());

        try {
            entity.setBasicDemographics(objectMapper.writeValueAsString(dto.getBasicDemographics()));
            entity.setIdentificationDetails(objectMapper.writeValueAsString(dto.getIdentification()));
            entity.setMedicalHistory(objectMapper.writeValueAsString(dto.getMedicalHistory()));
            entity.setLifestyleInfo(objectMapper.writeValueAsString(dto.getLifestyle()));
            entity.setCurrentHealth(objectMapper.writeValueAsString(dto.getCurrentHealth()));
            entity.setDocuments(objectMapper.writeValueAsString(dto.getDocuments())); // ADDED: Handle documents
            entity.setConsentPreferences(objectMapper.writeValueAsString(dto.getConsentPreferences()));
        } catch (Exception e) {
            throw new RuntimeException("Error converting DTO to entity", e);
        }

        return entity;
    }

    PatientHealthRecordDTO convertToDTO(PatientHealthRecord entity) {
        PatientHealthRecordDTO dto = new PatientHealthRecordDTO();
        dto.setId(entity.getId().toString());
        dto.setPatientId(entity.getPatientId());

        try {
            if (entity.getBasicDemographics() != null) {
                dto.setBasicDemographics(objectMapper.readValue(entity.getBasicDemographics(), BasicDemographicsDTO.class));
            }
            if (entity.getIdentificationDetails() != null) {
                dto.setIdentification(objectMapper.readValue(entity.getIdentificationDetails(), IdentificationDetailsDTO.class));
            }
            if (entity.getMedicalHistory() != null) {
                dto.setMedicalHistory(objectMapper.readValue(entity.getMedicalHistory(),
                        new TypeReference<List<MedicalHistoryItemDTO>>() {}));
            }
            if (entity.getLifestyleInfo() != null) {
                dto.setLifestyle(objectMapper.readValue(entity.getLifestyleInfo(), LifestyleInformationDTO.class));
            }
            if (entity.getCurrentHealth() != null) {
                dto.setCurrentHealth(objectMapper.readValue(entity.getCurrentHealth(), CurrentHealthDataDTO.class));
            }
            if (entity.getDocuments() != null) { // ADDED: Handle documents
                dto.setDocuments(objectMapper.readValue(entity.getDocuments(),
                        new TypeReference<List<HealthDocumentDTO>>() {}));
            }
            if (entity.getConsentPreferences() != null) {
                dto.setConsentPreferences(objectMapper.readValue(entity.getConsentPreferences(), ConsentPreferencesDTO.class));
            }
        } catch (Exception e) {
            throw new RuntimeException("Error converting entity to DTO", e);
        }

        dto.setCreatedAt(entity.getCreatedAt().toString());
        dto.setUpdatedAt(entity.getUpdatedAt().toString());
        dto.setLastAccessedAt(entity.getLastAccessedAt() != null ? entity.getLastAccessedAt().toString() : null);

        return dto;
    }
}