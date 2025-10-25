package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@RequestBody ReviewRequest reviewRequest) {
        return ResponseEntity.ok(reviewService.createReview(reviewRequest));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ReviewResponse>> getPatientReviews(@PathVariable Long patientId) {
        return ResponseEntity.ok(reviewService.getPatientReviews(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ReviewResponse>> getDoctorReviews(@PathVariable Long doctorId) {
        return ResponseEntity.ok(reviewService.getDoctorReviews(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/rating")
    public ResponseEntity<DoctorRatingResponse> getDoctorRating(@PathVariable Long doctorId) {
        return ResponseEntity.ok(reviewService.getDoctorRating(doctorId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @RequestBody ReviewRequest reviewRequest) {
        return ResponseEntity.ok(reviewService.updateReview(id, reviewRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/appointment/{appointmentId}/can-review")
    public ResponseEntity<CanReviewResponse> canReviewAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(reviewService.canReviewAppointment(appointmentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }
}