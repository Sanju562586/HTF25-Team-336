// IdentificationDetailsDTO.java
package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class IdentificationDetailsDTO {
    private String patientId;
    private String nationalId;
    private String insurancePolicyNumber;
}