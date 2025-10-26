package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.UrgencyLevel;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmergencyRequestDTO {
    private String id;
    private String patientId;
    private String patientName;
    private String patientPhone;
    private String symptoms;
    private UrgencyLevel urgencyLevel;
    private String location;
    private String status;
    private String acceptedBy;
    private String doctorId;
    private String doctorName;
    private String estimatedArrivalTime;
    private String createdAt;
    private String updatedAt;
    private String notes;
}
