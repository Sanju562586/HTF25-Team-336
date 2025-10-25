package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.AppointmentRequestDTO;
import com.healthcare.medVault.dto.AppointmentRescheduleDTO;
import com.healthcare.medVault.dto.AppointmentResponseDTO;
import com.healthcare.medVault.dto.AppointmentStatusUpdateDTO;
import com.healthcare.medVault.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(@RequestBody AppointmentRequestDTO appointmentRequestDTO) {
        AppointmentResponseDTO response = appointmentService.bookAppointment(appointmentRequestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDTO> getAppointmentById(@PathVariable Long id) {
        AppointmentResponseDTO response = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByPatientId(@PathVariable Long patientId) {
        List<AppointmentResponseDTO> response = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByDoctorId(@PathVariable Long doctorId) {
        List<AppointmentResponseDTO> response = appointmentService.getAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        List<AppointmentResponseDTO> response = appointmentService.getAllAppointments();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDTO> updateAppointmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateDTO statusUpdateDTO) {
        AppointmentResponseDTO response = appointmentService.updateAppointmentStatus(id, statusUpdateDTO);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponseDTO> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRescheduleDTO rescheduleDTO) {
        AppointmentResponseDTO response = appointmentService.rescheduleAppointment(id, rescheduleDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}