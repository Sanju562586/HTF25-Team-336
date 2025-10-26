package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class DoctorAvailabilityDTO {
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private Boolean isAvailable;
    private String currentLocation;
}