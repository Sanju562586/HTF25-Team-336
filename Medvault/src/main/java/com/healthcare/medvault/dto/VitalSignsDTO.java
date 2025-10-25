// VitalSignsDTO.java
package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class VitalSignsDTO {
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Integer pulse;
    private Double temperature;
    private Integer respiratoryRate;
    private Double oxygenSaturation;
    private String recordedAt;
}