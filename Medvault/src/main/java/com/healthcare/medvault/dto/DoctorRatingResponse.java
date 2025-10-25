package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class DoctorRatingResponse {
    private Long doctorId;
    private Double averageRating;
    private Long totalReviews;
}