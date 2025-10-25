// MedicalHistoryItemDTO.java
package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.MedicalHistoryType;
import lombok.Data;

@Data
public class MedicalHistoryItemDTO {
    private String id;
    private MedicalHistoryType type;
    private String title;
    private String description;
    private String onsetDate;
    private String severity; // LOW, MODERATE, HIGH
    private Boolean isActive;
}