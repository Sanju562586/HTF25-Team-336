package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long appointmentId;
    private Integer rating;
    private String comment;
}