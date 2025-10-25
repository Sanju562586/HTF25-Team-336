package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.PatientMedicalRecordAccessDTO;
import com.healthcare.medVault.service.DocumentPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final DocumentPermissionService permissionService;

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<PatientMedicalRecordAccessDTO> getPatientMedicalRecord(
            @PathVariable String appointmentId) {
        PatientMedicalRecordAccessDTO record = permissionService.getPatientMedicalRecord(appointmentId);
        return ResponseEntity.ok(record);
    }
}