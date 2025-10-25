package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.AppointmentStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class AppointmentResponseDTO {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long slotId;
    private String patientName;
    private String doctorName;
    private String specialization;
    private LocalDate date;
    private LocalTime timeFrom;
    private LocalTime timeTo;
    private AppointmentStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}