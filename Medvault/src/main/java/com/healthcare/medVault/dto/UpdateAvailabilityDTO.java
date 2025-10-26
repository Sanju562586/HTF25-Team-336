package com.healthcare.medVault.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class UpdateAvailabilityDTO {
    @JsonProperty("isAvailable")
    private Boolean isAvailable;
}