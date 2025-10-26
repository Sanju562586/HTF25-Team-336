package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.service.EmergencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
@RequiredArgsConstructor
public class EmergencyController {

    private final EmergencyService emergencyService;

    // Patient Emergency Requests
    @PostMapping("/request")
    public ResponseEntity<EmergencyRequestDTO> createEmergencyRequest(@RequestBody CreateEmergencyRequestDTO requestDTO) {
        EmergencyRequestDTO response = emergencyService.createEmergencyRequest(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<EmergencyRequestDTO>> getPatientEmergencyRequests(@PathVariable String patientId) {
        List<EmergencyRequestDTO> requests = emergencyService.getPatientEmergencyRequests(patientId);
        return ResponseEntity.ok(requests);
    }

    @DeleteMapping("/request/{requestId}")
    public ResponseEntity<Void> cancelEmergencyRequest(@PathVariable String requestId) {
        emergencyService.cancelEmergencyRequest(requestId);
        return ResponseEntity.ok().build();
    }

    // Doctor Emergency Management
    @GetMapping("/doctors/available")
    public ResponseEntity<List<DoctorAvailabilityDTO>> getAvailableDoctors() {
        List<DoctorAvailabilityDTO> doctors = emergencyService.getAvailableDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/doctor/{doctorId}/availability")
    public ResponseEntity<?> getDoctorAvailability(@PathVariable String doctorId) {
        try {
            boolean isAvailable = emergencyService.getDoctorAvailability(doctorId);
            return ResponseEntity.ok().body(new AvailabilityResponse(isAvailable));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching doctor availability: " + e.getMessage());
        }
    }

    @PatchMapping("/doctor/{doctorId}/availability")
    public ResponseEntity<Void> updateDoctorAvailability(
            @PathVariable String doctorId,
            @RequestBody UpdateAvailabilityDTO availabilityDTO) {
        emergencyService.updateDoctorAvailability(doctorId, availabilityDTO.getIsAvailable());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<EmergencyRequestDTO>> getPendingEmergencyRequests() {
        List<EmergencyRequestDTO> requests = emergencyService.getPendingEmergencyRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/doctor/{doctorId}/requests/pending")
    public ResponseEntity<List<EmergencyRequestDTO>> getPendingEmergencyRequests(@PathVariable String doctorId) {
        List<EmergencyRequestDTO> requests = emergencyService.getPendingEmergencyRequestsWithDid(doctorId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/doctor/{doctorId}/requests")
    public ResponseEntity<List<EmergencyRequestDTO>> getDoctorEmergencyRequests(@PathVariable String doctorId) {
        List<EmergencyRequestDTO> requests = emergencyService.getDoctorEmergencyRequests(doctorId);
        return ResponseEntity.ok(requests);
    }

    @PatchMapping("/doctor/{doctorId}/request/{requestId}/accept")
    public ResponseEntity<EmergencyRequestDTO> acceptEmergencyRequest(
            @PathVariable String doctorId,
            @PathVariable String requestId) {
        EmergencyRequestDTO response = emergencyService.acceptEmergencyRequest(doctorId,requestId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/doctor/{doctorId}/request/{requestId}/reject")
    public ResponseEntity<Void> rejectEmergencyRequest(
            @PathVariable String doctorId,
            @PathVariable String requestId,
            @RequestBody RejectEmergencyRequestDTO rejectDTO) {
        emergencyService.rejectEmergencyRequest(doctorId,requestId, rejectDTO);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/request/{requestId}/complete")
    public ResponseEntity<EmergencyRequestDTO> completeEmergencyRequest(
            @PathVariable String requestId,
            @RequestBody CompleteEmergencyRequestDTO completeDTO) {
        EmergencyRequestDTO response = emergencyService.completeEmergencyRequest(requestId, completeDTO);
        return ResponseEntity.ok(response);
    }

    // Statistics
    @GetMapping("/stats")
    public ResponseEntity<EmergencyStatsDTO> getEmergencyStats() {
        EmergencyStatsDTO stats = emergencyService.getEmergencyStats();
        return ResponseEntity.ok(stats);
    }
}

