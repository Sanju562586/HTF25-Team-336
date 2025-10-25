// AddressDTO.java
package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class AddressDTO {
    private String street;
    private String city;
    private String state;
    private String pincode;
}