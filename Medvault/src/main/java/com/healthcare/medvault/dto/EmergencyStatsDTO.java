package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class EmergencyStatsDTO {
    private Long totalRequests;
    private Long pendingRequests;
    private Long acceptedRequests;
    private Long completedRequests;
    private Double averageResponseTime;
}