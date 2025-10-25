package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class AvailabilityResponse {
    private boolean isAvailable;

    public AvailabilityResponse(boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
}