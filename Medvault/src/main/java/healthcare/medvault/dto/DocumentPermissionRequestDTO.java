package com.healthcare.medVault.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DocumentPermissionRequestDTO {
    private String id;
    private String appointmentId;
    private String doctorId;
    private String doctorName;
    private String patientId;
    private String documentId;
    private String documentName;
    private String documentType;
    private String requestMessage;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime expiresAt;
    private Boolean isExpired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

