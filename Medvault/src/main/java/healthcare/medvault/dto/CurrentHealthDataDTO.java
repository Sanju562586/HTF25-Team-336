// CurrentHealthDataDTO.java
package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class CurrentHealthDataDTO {
    private Double weight;
    private Double height;
    private Double bmi;
    private VitalSignsDTO vitals;
    private java.util.List<CurrentMedicationDTO> medications;
    private String lastUpdated;
}