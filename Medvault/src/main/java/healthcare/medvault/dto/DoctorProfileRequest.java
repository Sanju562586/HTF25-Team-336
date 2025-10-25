package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.Gender;
import lombok.Data;

import java.util.List;

@Data
public class DoctorProfileRequest {
    private String userId;
    private String firstName;
    private String lastName;
    private Gender gender;
    private String dateOfBirth;
    private String contactNumber;
    private String address;
    private List<String> specialization;
    private String department;
    private Integer yearsOfExperience;
    private Double consultationFees;
    private List<String> languagesSpoken;
    private String licenseNumber;
    private String governmentIdNumber;

    private String medicalDegreeUrl;
    private String governmentIdUrl;
    private String affiliationProofUrl;
    private Double latitude;
    private Double longitude;
}