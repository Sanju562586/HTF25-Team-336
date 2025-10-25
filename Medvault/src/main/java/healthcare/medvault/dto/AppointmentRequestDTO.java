package com.healthcare.medVault.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRequestDTO {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Slot ID is required")
    @JsonProperty("timeSlotId")
    private Long slotId;

    @JsonProperty("notes")
    private String notes;
}