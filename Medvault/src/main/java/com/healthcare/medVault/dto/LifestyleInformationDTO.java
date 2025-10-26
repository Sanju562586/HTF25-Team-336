// LifestyleInformationDTO.java
package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.ActivityLevel;
import com.healthcare.medVault.helper.AlcoholHabit;
import com.healthcare.medVault.helper.DietaryPreference;
import com.healthcare.medVault.helper.SmokingHabit;
import lombok.Data;

@Data
public class LifestyleInformationDTO {
    private SmokingHabit smokingHabit;
    private AlcoholHabit alcoholHabit;
    private DietaryPreference dietaryPreferences;
    private ActivityLevel physicalActivityLevel;
    private Integer sleepHours;
    private String stressLevel; // LOW, MODERATE, HIGH
    private String exerciseFrequency;
    private String sleepQuality; // POOR, FAIR, GOOD, EXCELLENT
}