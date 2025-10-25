package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String username;
    private Role role;
    private String message;

    @JsonProperty("first_login")
    private boolean firstLogin;

    @JsonProperty("isProfileComplete")
    private boolean isProfileCompleted;
}
