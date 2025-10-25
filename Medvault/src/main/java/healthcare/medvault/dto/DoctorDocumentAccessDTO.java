package com.healthcare.medVault.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DoctorDocumentAccessDTO {
    private String documentId;
    private String permissionId;
    private Boolean canView;
    private LocalDateTime expiresAt;
    private Long timeRemaining;
}