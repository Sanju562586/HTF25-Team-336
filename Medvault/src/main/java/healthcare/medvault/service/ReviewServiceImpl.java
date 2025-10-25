package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.*;
import com.healthcare.medVault.helper.AppointmentStatus;
import com.healthcare.medVault.repository.AppointmentRepository;
import com.healthcare.medVault.repository.DoctorRepository;
import com.healthcare.medVault.repository.PatientRepository;
import com.healthcare.medVault.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest reviewRequest) {
        Appointment appointment = appointmentRepository.findById(reviewRequest.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Check if appointment is completed
        if (!appointment.getStatus().equals(AppointmentStatus.APPROVED)) {
            throw new RuntimeException("Cannot review non-completed appointment");
        }

        // Check if review already exists for this appointment
        if (reviewRepository.existsByAppointmentId(appointment.getId())) {
            throw new RuntimeException("Review already exists for this appointment");
        }

        Review review = new Review();
        review.setAppointment(appointment);
        review.setDoctor(appointment.getDoctor());
        review.setPatient(appointment.getPatient());
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());

        Review savedReview = reviewRepository.save(review);
        return convertToResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getPatientReviews(Long patientId) {
        return reviewRepository.findByPatientId(patientId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getDoctorReviews(Long doctorId) {
        return reviewRepository.findByDoctorId(doctorId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorRatingResponse getDoctorRating(Long doctorId) {
        DoctorRatingResponse response = new DoctorRatingResponse();
        Double avgRating=reviewRepository.findAverageRatingByDoctorId(doctorId);
        response.setDoctorId(doctorId);
        response.setAverageRating(avgRating!=null?avgRating:0.0);
        response.setTotalReviews(reviewRepository.countByDoctorId(doctorId));
        return response;
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest reviewRequest) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());

        Review updatedReview = reviewRepository.save(review);
        return convertToResponse(updatedReview);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Review not found");
        }
        reviewRepository.deleteById(reviewId);
    }

    @Override
    public CanReviewResponse canReviewAppointment(Long appointmentId) {
        CanReviewResponse response = new CanReviewResponse();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Check if appointment is completed
        response.setCanReview(appointment.getStatus().equals(AppointmentStatus.APPROVED));

        // Check if review already exists
        response.setHasReviewed(reviewRepository.existsByAppointmentId(appointmentId));

        return response;
    }

    @Override
    public ReviewResponse getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        return convertToResponse(review);
    }

    private ReviewResponse convertToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setAppointmentId(review.getAppointment().getId());
        response.setPatientId(review.getPatient().getId());
        response.setDoctorId(review.getDoctor().getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setPatientName(review.getPatient().getFirstName() + " " + review.getPatient().getLastName());
        response.setDoctorName(review.getDoctor().getFirstName() + " " + review.getDoctor().getLastName());
        response.setDoctorSpecialization(review.getDoctor().getSpecialization());
        response.setAppointmentDate(review.getAppointment().getAppointmentDateTime());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }
}