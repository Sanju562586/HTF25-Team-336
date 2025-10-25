package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.Review;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(ReviewRequest reviewRequest);
    List<ReviewResponse> getPatientReviews(Long patientId);
    List<ReviewResponse> getDoctorReviews(Long doctorId);
    DoctorRatingResponse getDoctorRating(Long doctorId);
    ReviewResponse updateReview(Long reviewId, ReviewRequest reviewRequest);
    void deleteReview(Long reviewId);
    CanReviewResponse canReviewAppointment(Long appointmentId);
    ReviewResponse getReviewById(Long reviewId);
}