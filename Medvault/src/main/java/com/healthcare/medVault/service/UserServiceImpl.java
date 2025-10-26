package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.AuthResponse;
import com.healthcare.medVault.dto.LoginRequest;
import com.healthcare.medVault.dto.RegisterRequest;
import com.healthcare.medVault.dto.ResetPasswordRequest;
import com.healthcare.medVault.helper.Role;
import com.healthcare.medVault.entity.User;
import com.healthcare.medVault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getEmail())) {
            throw new RuntimeException("Username already taken!");
        }

        User user = new User();
        user.setUsername(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // encode password
        user.setRole(request.getRole() != null ? request.getRole() : Role.PATIENT);
        userRepository.save(user);
        sendRegistrationEmail(request);
        return user;
    }

    @Override
    public void sendRegistrationEmail(RegisterRequest registerRequest) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(registerRequest.getEmail());
            message.setSubject("Welcome to MedVault - Your Account Details");
            message.setText("Hello " + registerRequest.getName() + ",\n\n" +
                    "Your account has been created successfully.\n" +
                    "Username (Email): " + registerRequest.getEmail() + "\n" +
                    "Temporary Password: " + registerRequest.getPassword() + "\n\n" +
                    "Please log in and reset your password immediately.\n\n" +
                    "Best Regards,\nMedVault Team");
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace(); // log the exact email sending error
        }
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return new AuthResponse(user.getUsername(), user.getRole(), "Login successful!",user.isFirst_login(),user.isProfileCompleted());
    }

    @Override
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirst_login(false);
        userRepository.save(user);
        sendPasswordResetEmail(user);
        return "Password reset successful";
    }

    @Override
    public void sendPasswordResetEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getUsername());
            message.setSubject("MedVault - Password Reset Successful");
            message.setText("Hello " + user.getUsername() + ",\n\n" +
                    "Your password has been successfully reset.\n" +
                    "If you did not perform this action, please contact our support immediately.\n\n" +
                    "Best Regards,\nMedVault Team");
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
