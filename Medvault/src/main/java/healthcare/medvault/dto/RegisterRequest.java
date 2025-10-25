package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
