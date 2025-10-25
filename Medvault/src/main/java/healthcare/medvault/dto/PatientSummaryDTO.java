package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.Gender;
import com.healthcare.medVault.helper.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class PatientSummaryDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String contactNumber;
    private String address;
    private String governmentIdNumber;
    private String governmentIdUrl;
    private VerificationStatus status;
}