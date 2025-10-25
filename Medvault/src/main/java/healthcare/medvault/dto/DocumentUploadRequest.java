// DocumentUploadRequest.java
package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.DocumentType;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DocumentUploadRequest {
    private String patientId;
    private DocumentType documentType;
    private String description;
    private MultipartFile file;
}