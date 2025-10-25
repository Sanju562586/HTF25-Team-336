package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.DoctorResponse;
import com.healthcare.medVault.dto.PatientResponse;
import com.healthcare.medVault.dto.PaginationResponse;

import java.util.Map;

public interface AdminService {
    PaginationResponse<DoctorResponse> getDoctors(int page, int limit, String search);
    PaginationResponse<PatientResponse> getPatients(int page, int limit, String search);
    void deleteDoctor(Long id);
    void deletePatient(Long id);
}