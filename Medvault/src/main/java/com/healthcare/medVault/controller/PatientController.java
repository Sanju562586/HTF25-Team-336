package com.healthcare.medVault.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.healthcare.medVault.dto.PatientProfileDTO;
import com.healthcare.medVault.dto.PatientSummaryDTO;
import com.healthcare.medVault.repository.PatientRepository;
import com.healthcare.medVault.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles/patient")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/{username}")
    public ResponseEntity<PatientProfileDTO> getProfile(@PathVariable String username) {
        return ResponseEntity.ok(patientService.getPatientProfileByUsername(username));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PatientSummaryDTO>> getPendingPatients() {
        List<PatientSummaryDTO> pendingPatients = patientService.getPendingPatients();
        return ResponseEntity.ok(pendingPatients);
    }

    @PostMapping
    public ResponseEntity<PatientProfileDTO> createProfile(@RequestBody PatientProfileDTO dto) {
        return ResponseEntity.ok(patientService.createPatientProfile(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientProfileDTO> updateProfile(
            @PathVariable Long id,
            @RequestBody PatientProfileDTO dto
    ) {
        return ResponseEntity.ok(patientService.updatePatientProfile(id, dto));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<PatientProfileDTO> verifyPatientProfile(
            @PathVariable Long id,
            @RequestBody VerificationRequest verificationRequest
    ) {
        PatientProfileDTO verifiedProfile = patientService.verifyPatientProfile(id, verificationRequest.isVerified());
        return ResponseEntity.ok(verifiedProfile);
    }

    public static class VerificationRequest {
        @JsonProperty("isVerified")
        private boolean verified;

        public VerificationRequest() {}

        // Parameterized constructor
        public VerificationRequest(boolean verified) {
            this.verified = verified;
        }

        public boolean isVerified() {
            return verified;
        }

        public void setVerified(boolean verified) {
            this.verified = verified;
        }
    }
}

