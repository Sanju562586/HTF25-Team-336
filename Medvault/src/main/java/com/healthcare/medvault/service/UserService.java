package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.AuthResponse;
import com.healthcare.medVault.dto.LoginRequest;
import com.healthcare.medVault.dto.RegisterRequest;
import com.healthcare.medVault.dto.ResetPasswordRequest;
import com.healthcare.medVault.entity.User;

public interface UserService {
    User register(RegisterRequest request);
    void sendRegistrationEmail(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest request);
    String resetPassword(ResetPasswordRequest request);
    public void sendPasswordResetEmail(User user);
}
