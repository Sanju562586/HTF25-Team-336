package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.Gender;
import com.healthcare.medVault.helper.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String contactNumber;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    private Double latitude;
    private Double longitude;
    private VerificationStatus status;
    private LocalDateTime createdAt;
}