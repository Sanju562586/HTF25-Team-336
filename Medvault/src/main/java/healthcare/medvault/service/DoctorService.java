package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.DoctorProfileRequest;
import com.healthcare.medVault.dto.DoctorProfileResponse;
import com.healthcare.medVault.entity.Doctor;

import java.util.List;

public interface DoctorService {
    public List<DoctorProfileResponse> getPendingDoctors();
    public List<DoctorProfileResponse> getApprovedDoctors();
    public DoctorProfileResponse verifyDoctorProfile(Long id, boolean isVerified);
    public DoctorProfileResponse createDoctorProfile(DoctorProfileRequest request);
    Doctor getDoctorProfileByUserId(String userId);
    Doctor updateDoctorProfile(Long id, DoctorProfileRequest request);
}