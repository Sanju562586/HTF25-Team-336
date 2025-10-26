// CurrentMedicationDTO.java
package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class CurrentMedicationDTO {
    private String id;
    private String name;
    private String dosage;
    private String frequency;
    private String prescribedBy;
    private String startDate;
    private String endDate;
    private String notes;
    private Boolean isActive;
}