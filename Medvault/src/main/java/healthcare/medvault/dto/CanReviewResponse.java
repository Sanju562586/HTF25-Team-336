package com.healthcare.medVault.dto;

import lombok.Data;

@Data
public class CanReviewResponse {
    private Boolean canReview;
    private Boolean hasReviewed;
}
