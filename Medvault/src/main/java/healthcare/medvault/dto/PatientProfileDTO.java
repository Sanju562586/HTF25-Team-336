package com.healthcare.medVault.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.healthcare.medVault.helper.Gender;
import com.healthcare.medVault.helper.VerificationStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientProfileDTO {
    private Long id;
    private String userId;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String contactNumber;
    private String address;
    private String emergencyContact;
    private String governmentIdNumber;
    private String governmentIdUrl;
    private Double latitude;
    private Double longitude;

    private VerificationStatus status;

    @JsonProperty("isProfileComplete")
    private boolean isProfileComplete;

    private UserDTO user;
}
