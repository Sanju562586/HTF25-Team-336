// HealthRecordController.java
package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.service.PatientHealthRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-records")
@RequiredArgsConstructor
public class HealthRecordController {

    private final PatientHealthRecordService healthRecordService;

    @GetMapping("/{patientId}")
    public ResponseEntity<PatientHealthRecordDTO> getHealthRecord(@PathVariable String patientId) {
        return healthRecordService.getHealthRecord(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PatientHealthRecordDTO> createHealthRecord(
            @RequestBody PatientHealthRecordDTO healthRecordDTO) {
        PatientHealthRecordDTO createdRecord = healthRecordService.createHealthRecord(healthRecordDTO);
        return ResponseEntity.ok(createdRecord);
    }

    @PatchMapping("/{patientId}/section/{section}")
    public ResponseEntity<PatientHealthRecordDTO> updateHealthRecordSection(
            @PathVariable String patientId,
            @PathVariable String section,
            @RequestBody Object data) {
        PatientHealthRecordDTO updatedRecord = healthRecordService.updateHealthRecordSection(patientId, section, data);
        return ResponseEntity.ok(updatedRecord);
    }

    @PatchMapping("/{patientId}/demographics")
    public ResponseEntity<PatientHealthRecordDTO> updateBasicDemographics(
            @PathVariable String patientId,
            @RequestBody BasicDemographicsDTO demographics) {
        PatientHealthRecordDTO updatedRecord = healthRecordService.updateHealthRecordSection(
                patientId, "basicDemographics", demographics);
        return ResponseEntity.ok(updatedRecord);
    }

    @PatchMapping("/{patientId}/identification")
    public ResponseEntity<PatientHealthRecordDTO> updateIdentification(
            @PathVariable String patientId,
            @RequestBody IdentificationDetailsDTO identification) {
        PatientHealthRecordDTO updatedRecord = healthRecordService.updateHealthRecordSection(
                patientId, "identification", identification);
        return ResponseEntity.ok(updatedRecord);
    }

    @PatchMapping("/{patientId}/lifestyle")
    public ResponseEntity<PatientHealthRecordDTO> updateLifestyle(
            @PathVariable String patientId,
            @RequestBody LifestyleInformationDTO lifestyle) {
        PatientHealthRecordDTO updatedRecord = healthRecordService.updateHealthRecordSection(
                patientId, "lifestyle", lifestyle);
        return ResponseEntity.ok(updatedRecord);
    }

    @PatchMapping("/{patientId}/current-health")
    public ResponseEntity<PatientHealthRecordDTO> updateCurrentHealth(
            @PathVariable String patientId,
            @RequestBody CurrentHealthDataDTO currentHealth) {
        PatientHealthRecordDTO updatedRecord = healthRecordService.updateHealthRecordSection(
                patientId, "currentHealth", currentHealth);
        return ResponseEntity.ok(updatedRecord);
    }

    @PatchMapping("/{patientId}/consent")
    public ResponseEntity<PatientHealthRecordDTO> updateConsentPreferences(
            @PathVariable String patientId,
            @RequestBody ConsentPreferencesDTO consent) {
        PatientHealthRecordDTO updatedRecord = healthRecordService.updateHealthRecordSection(
                patientId, "consentPreferences", consent);
        return ResponseEntity.ok(updatedRecord);
    }

    @PatchMapping("/{patientId}/bulk-update")
    public ResponseEntity<PatientHealthRecordDTO> bulkUpdateHealthRecord(
            @PathVariable String patientId,
            @RequestBody List<HealthRecordUpdateRequestDTO> updates) {
        // Implement bulk update logic
        // For simplicity, we'll process each update sequentially
        PatientHealthRecordDTO result = null;
        for (HealthRecordUpdateRequestDTO update : updates) {
            result = healthRecordService.updateHealthRecordSection(
                    patientId, update.getSection(), update.getData());
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{patientId}/summary")
    public ResponseEntity<HealthRecordSummaryDTO> getHealthRecordSummary(@PathVariable String patientId) {
        HealthRecordSummaryDTO summary = healthRecordService.getHealthRecordSummary(patientId);
        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/{patientId}")
    public ResponseEntity<Void> deleteHealthRecord(@PathVariable String patientId) {
        healthRecordService.deleteHealthRecord(patientId);
        return ResponseEntity.noContent().build();
    }
}