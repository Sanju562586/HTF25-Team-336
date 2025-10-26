// HealthRecordUpdateRequestDTO.java
package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class HealthRecordUpdateRequestDTO {
    private String section;
    private Object data;
}