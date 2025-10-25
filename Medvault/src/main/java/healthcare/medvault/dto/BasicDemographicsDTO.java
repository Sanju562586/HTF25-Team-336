// BasicDemographicsDTO.java
package com.healthcare.medVault.dto;

import com.healthcare.medVault.helper.BloodGroup;
import com.healthcare.medVault.helper.Gender;
import com.healthcare.medVault.helper.MaritalStatus;
import lombok.Data;

@Data
public class BasicDemographicsDTO {
    private String fullName;
    private Gender gender;
    private String dateOfBirth;
    private BloodGroup bloodGroup;
    private String contactNumber;
    private String email;
    private AddressDTO address;
    private String emergencyContact;
    private MaritalStatus maritalStatus;
    private String occupation;
}