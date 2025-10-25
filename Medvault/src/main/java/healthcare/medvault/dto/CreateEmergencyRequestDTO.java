package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.UrgencyLevel;
import lombok.Data;

@Data
public class CreateEmergencyRequestDTO {
    private String patientId;
    private String symptoms;
    private UrgencyLevel urgencyLevel;
    private String location;
    private String notes;
}