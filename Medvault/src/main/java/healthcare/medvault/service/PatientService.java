package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.PatientProfileDTO;
import com.healthcare.medVault.dto.PatientSummaryDTO;
import com.healthcare.medVault.entity.Patient;
import com.healthcare.medVault.helper.VerificationStatus;

import java.util.List;

public interface PatientService {
    public PatientProfileDTO getPatientProfileByUsername(String username);
    public PatientProfileDTO createPatientProfile(PatientProfileDTO dto);
    public PatientProfileDTO updatePatientProfile(Long id, PatientProfileDTO dto);
    public List<PatientSummaryDTO> getPendingPatients();
    public PatientProfileDTO verifyPatientProfile(Long id, boolean isVerified);
}
