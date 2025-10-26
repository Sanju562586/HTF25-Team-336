package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.AuthResponse;
import com.healthcare.medVault.dto.LoginRequest;
import com.healthcare.medVault.dto.RegisterRequest;
import com.healthcare.medVault.dto.ResetPasswordRequest;
import com.healthcare.medVault.entity.User;
import com.healthcare.medVault.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;
    public AuthController(UserService userService){
        this.userService=userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PutMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(userService.resetPassword(request));
    }
}

