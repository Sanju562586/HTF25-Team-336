// HealthRecordSummaryDTO.java
package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class HealthRecordSummaryDTO {
    private Integer completionPercentage;
    private String lastUpdated;
    private Integer activeMedications;
    private Integer upcomingReminders;
}