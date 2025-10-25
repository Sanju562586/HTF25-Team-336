package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.PatientHealthRecordDTO;
import com.healthcare.medVault.dto.HealthRecordSummaryDTO;

import java.util.Optional;

public interface PatientHealthRecordService {

    Optional<PatientHealthRecordDTO> getHealthRecord(String patientId);
    
    PatientHealthRecordDTO createHealthRecord(PatientHealthRecordDTO dto);

    PatientHealthRecordDTO updateHealthRecordSection(String patientId, String section, Object data);

    void deleteHealthRecord(String patientId);

    HealthRecordSummaryDTO getHealthRecordSummary(String patientId);
}