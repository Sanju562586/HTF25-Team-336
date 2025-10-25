package com.healthcare.medVault.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRescheduleDTO {
    @NotNull(message = "New time slot ID is required")
    private Long newTimeSlotId;

    @NotNull(message = "New date is required")
    private String newDate;

    @NotNull(message = "New time from is required")
    private String newTimeFrom;

    @NotNull(message = "New time to is required")
    private String newTimeTo;
}