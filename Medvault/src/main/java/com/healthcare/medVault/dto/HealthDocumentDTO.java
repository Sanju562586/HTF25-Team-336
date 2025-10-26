// HealthDocumentDTO.java
package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.DocumentType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HealthDocumentDTO {
    private Long id;
    private String patientId;
    private String name;
    private DocumentType type;
    private String url;
    private LocalDateTime uploadDate;
    private Long size;
    private String description;
}