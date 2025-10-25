package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentStatusUpdateDTO {
    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    private String notes;
}