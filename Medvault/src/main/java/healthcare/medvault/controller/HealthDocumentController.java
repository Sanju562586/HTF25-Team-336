// HealthDocumentController.java
package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.HealthDocumentDTO;
import com.healthcare.medVault.helper.DocumentType;
import com.healthcare.medVault.service.HealthDocumentService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/health-documents")
public class HealthDocumentController {

    private final HealthDocumentService healthDocumentService;

    public HealthDocumentController(HealthDocumentService healthDocumentService) {
        this.healthDocumentService = healthDocumentService;
    }

    @PostMapping("/{patientId}/upload")
    public ResponseEntity<HealthDocumentDTO> uploadDocument(
            @PathVariable String patientId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "description", required = false) String description) {

        HealthDocumentDTO uploadedDocument = healthDocumentService.uploadDocument(
                patientId, file, documentType, description);

        return ResponseEntity.ok(uploadedDocument);
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<List<HealthDocumentDTO>> getDocumentsByPatientId(@PathVariable String patientId) {
        List<HealthDocumentDTO> documents = healthDocumentService.getDocumentsByPatientId(patientId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{patientId}/{id}")
    public ResponseEntity<HealthDocumentDTO> getDocumentById(
            @PathVariable String patientId,
            @PathVariable Long id) {

        HealthDocumentDTO document = healthDocumentService.getDocumentById(id, patientId);
        return ResponseEntity.ok(document);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id) {

        healthDocumentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable String fileName) {
        byte[] fileContent = healthDocumentService.downloadDocument(fileName);

        ByteArrayResource resource = new ByteArrayResource(fileContent);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}