package com.healthcare.medVault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserStatsDTO {
    private Long totalUsers;
    private Long totalDoctors;
    private Long totalPatients;
    private Long totalAppointments;
    private Long pendingVerifications;
}
