package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.HealthDocument;
import com.healthcare.medVault.repository.HealthDocumentRepository;
import com.healthcare.medVault.service.DocumentPermissionService;
import com.healthcare.medVault.service.HealthDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/document-permissions")
@RequiredArgsConstructor
public class DocumentPermissionController {

    @Autowired
    private final DocumentPermissionService permissionService;
    @Autowired
    private HealthDocumentRepository healthDocumentRepository;
    @Autowired
    private HealthDocumentService healthDocumentService;

    @PostMapping("/request")
    public ResponseEntity<DocumentPermissionRequestDTO> requestDocumentPermission(
            @RequestBody DocumentPermissionRequestDTO request) {
        DocumentPermissionRequestDTO response = permissionService.requestDocumentPermission(
                request.getAppointmentId(),
                request.getDocumentId(),
                request.getRequestMessage()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{permissionRequestId}/respond")
    public ResponseEntity<DocumentPermissionRequestDTO> respondToPermissionRequest(
            @PathVariable String permissionRequestId,
            @RequestBody DocumentPermissionResponseDTO response) {
        DocumentPermissionRequestDTO result = permissionService.respondToPermissionRequest(permissionRequestId, response);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/patient/{patientId}/requests")
    public ResponseEntity<List<DocumentPermissionRequestDTO>> getPatientPermissionRequests(
            @PathVariable String patientId) {
        List<DocumentPermissionRequestDTO> requests = permissionService.getPatientPermissionRequests(patientId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/doctor/appointment/{appointmentId}/access")
    public ResponseEntity<List<DoctorDocumentAccessDTO>> getDoctorDocumentAccess(
            @PathVariable String appointmentId) {
        List<DoctorDocumentAccessDTO> accessList = permissionService.getDoctorDocumentAccess(appointmentId);
        return ResponseEntity.ok(accessList);
    }

    @PostMapping("/{permissionRequestId}/revoke")
    public ResponseEntity<Void> revokeDocumentPermission(@PathVariable String permissionRequestId) {
        permissionService.revokeDocumentPermission(permissionRequestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-access/{documentId}/{appointmentId}")
    public ResponseEntity<DoctorDocumentAccessDTO> checkDocumentAccess(
            @PathVariable String documentId,
            @PathVariable String appointmentId) {
        DoctorDocumentAccessDTO access = permissionService.checkDocumentAccess(documentId, appointmentId);
        return ResponseEntity.ok(access);
    }


    @GetMapping("/documents/{documentId}")
    public ResponseEntity<ByteArrayResource> getDocumentById(@PathVariable Long documentId) {
        // First get the document metadata to find the filename
        HealthDocument document = healthDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));

        // Extract filename from filePath or URL
        String fileName = extractFileName(document.getFilePath());

        byte[] fileContent = healthDocumentService.downloadDocument(fileName);
        ByteArrayResource resource = new ByteArrayResource(fileContent);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    private String extractFileName(String filePath) {
        // Extract just the filename from the full path
        return filePath.substring(filePath.lastIndexOf("/") + 1);
    }
}