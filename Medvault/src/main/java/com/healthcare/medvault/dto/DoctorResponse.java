package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String contactNumber;
    private Double latitude;
    private Double longitude;
    private List<String> specialization;
    private String department;
    private Integer yearsOfExperience;
    private String licenseNumber;
    private VerificationStatus status;
    private LocalDateTime createdAt;
}