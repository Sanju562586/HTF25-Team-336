package com.healthcare.medVault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DepartmentDistributionDTO {
    private String department;
    private Long count;
}
