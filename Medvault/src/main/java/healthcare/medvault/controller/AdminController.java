package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.DoctorResponse;
import com.healthcare.medVault.dto.PatientResponse;
import com.healthcare.medVault.dto.PaginationResponse;
import com.healthcare.medVault.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/doctors")
    public ResponseEntity<Map<String, Object>> getDoctors(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) String search) {

        PaginationResponse<DoctorResponse> response = adminService.getDoctors(page, limit, search);

        return ResponseEntity.ok(Map.of(
                "doctors", response.getData(),
                "pagination", response.getPagination()
        ));
    }

    @GetMapping("/patients")
    public ResponseEntity<Map<String, Object>> getPatients(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search) {

        PaginationResponse<PatientResponse> response = adminService.getPatients(page, limit, search);

        return ResponseEntity.ok(Map.of(
                "patients", response.getData(),
                "pagination", response.getPagination()
        ));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Map<String, String>> deleteDoctor(@PathVariable Long id) {
        try {
            adminService.deleteDoctor(id);
            return ResponseEntity.ok(Map.of("message", "Doctor removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to remove doctor"));
        }
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Map<String, String>> deletePatient(@PathVariable Long id) {
        try {
            adminService.deletePatient(id);
            return ResponseEntity.ok(Map.of("message", "Patient removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to remove patient"));
        }
    }
}