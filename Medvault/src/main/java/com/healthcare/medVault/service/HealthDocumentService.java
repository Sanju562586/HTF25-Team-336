package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.HealthDocumentDTO;
import com.healthcare.medVault.helper.DocumentType;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface HealthDocumentService {
    HealthDocumentDTO uploadDocument(String patientId, MultipartFile file,
                                     DocumentType documentType, String description);
    List<HealthDocumentDTO> getDocumentsByPatientId(String patientId);
    HealthDocumentDTO getDocumentById(Long id, String patientId);
    void deleteDocument(Long id);
    byte[] downloadDocument(String fileName);
}