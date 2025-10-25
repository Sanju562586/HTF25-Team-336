package com.healthcare.medVault.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class UserDTO {
    private String username;
    private String role;
    private boolean firstLogin;
    private String message;
    @JsonProperty("isProfileComplete")
    private boolean isProfileComplete;
}
