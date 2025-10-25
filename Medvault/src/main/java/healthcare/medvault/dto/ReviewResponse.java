package com.healthcare.medVault.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private Integer rating;
    private String comment;
    private String patientName;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDateTime appointmentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}