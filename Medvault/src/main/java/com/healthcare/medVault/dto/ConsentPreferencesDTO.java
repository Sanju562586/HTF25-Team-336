// ConsentPreferencesDTO.java
package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class ConsentPreferencesDTO {
    private Boolean dataSharingConsent;
    private Boolean smsNotifications;
    private Boolean emailNotifications;
    private String preferredLanguage;
    private Boolean emergencyContactConsent;
    private Boolean researchParticipation;
}