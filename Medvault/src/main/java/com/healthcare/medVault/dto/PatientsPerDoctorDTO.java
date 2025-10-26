package com.healthcare.medVault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PatientsPerDoctorDTO {
    private String doctorName;
    private Long patientCount;
}
