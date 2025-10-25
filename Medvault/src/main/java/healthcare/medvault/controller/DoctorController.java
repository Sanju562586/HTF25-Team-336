package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.DoctorProfileRequest;
import com.healthcare.medVault.dto.DoctorProfileResponse;
import com.healthcare.medVault.dto.PatientProfileDTO;
import com.healthcare.medVault.entity.Doctor;
import com.healthcare.medVault.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles/doctor")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<DoctorProfileResponse>> getPendingDoctors() {
        List<DoctorProfileResponse> pendingDoctors = doctorService.getPendingDoctors();
        return ResponseEntity.ok(pendingDoctors);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<DoctorProfileResponse>> getApprovedDoctors() {
        List<DoctorProfileResponse> approvedDoctors = doctorService.getApprovedDoctors();
        return ResponseEntity.ok(approvedDoctors);
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<DoctorProfileResponse> verifyDoctorProfile(
            @PathVariable Long id,
            @RequestBody PatientController.VerificationRequest verificationRequest
    ) {
        DoctorProfileResponse verifiedProfile = doctorService.verifyDoctorProfile(id, verificationRequest.isVerified());
        return ResponseEntity.ok(verifiedProfile);
    }

    @PostMapping
    public ResponseEntity<DoctorProfileResponse> createDoctorProfile(@RequestBody DoctorProfileRequest request) {
        DoctorProfileResponse doctor = doctorService.createDoctorProfile(request);

        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<DoctorProfileResponse> getDoctorProfile(@PathVariable String userId) {
        Doctor doctor = doctorService.getDoctorProfileByUserId(userId);
        return ResponseEntity.ok(mapToResponse(doctor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorProfileResponse> updateDoctorProfile(@PathVariable Long id, @RequestBody DoctorProfileRequest request) {
        Doctor doctor = doctorService.updateDoctorProfile(id, request);
        return ResponseEntity.ok(mapToResponse(doctor));
    }

    private DoctorProfileResponse mapToResponse(Doctor doctor) {
        DoctorProfileResponse response = new DoctorProfileResponse();
        response.setId(doctor.getId());
        response.setUserId(doctor.getUser().getUsername());
        response.setFirstName(doctor.getFirstName());
        response.setLastName(doctor.getLastName());
        response.setGender(doctor.getGender());
        response.setDateOfBirth(doctor.getDateOfBirth());
        response.setContactNumber(doctor.getContactNumber());
        response.setAddress(doctor.getAddress());
    response.setLatitude(doctor.getLatitude());
    response.setLongitude(doctor.getLongitude());
        response.setSpecialization(doctor.getSpecialization());
        response.setDepartment(doctor.getDepartment());
        response.setYearsOfExperience(doctor.getYearsOfExperience());
        response.setConsultationFees(doctor.getConsultationFees());
        response.setLanguagesSpoken(doctor.getLanguagesSpoken());
        response.setMedicalDegreeUrl(doctor.getMedicalDegreeCertificate());
        response.setLicenseNumber(doctor.getMedicalCouncilRegistrationNumber());
        response.setGovernmentIdNumber(doctor.getGovernmentIdNumber());
        response.setGovernmentIdUrl(doctor.getGovernmentIdUrl());
        response.setAffiliationProofUrl(doctor.getClinicHospitalAffiliationProof());
        response.setProfileComplete(doctor.getUser().isProfileCompleted());
        response.setStatus(doctor.getStatus());

        return response;
    }
}