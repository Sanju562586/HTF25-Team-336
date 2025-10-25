package com.healthcare.medVault.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.healthcare.medVault.helper.Gender;
import com.healthcare.medVault.helper.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorProfileResponse {
    private Long id;
    private String userId;
    private String firstName;
    private String lastName;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String address;
    private String specialization;
    private String department;
    private Integer yearsOfExperience;
    private Double consultationFees;
    private String languagesSpoken;
    private String medicalDegreeUrl;
    private String licenseNumber;
    private String governmentIdNumber;
    private String governmentIdUrl;
    private String affiliationProofUrl;
    @JsonProperty("isProfileComplete")
    private boolean isProfileComplete;
    private VerificationStatus status;
    private Double latitude;
    private Double longitude;
}