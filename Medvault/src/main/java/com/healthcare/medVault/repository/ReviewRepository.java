package com.healthcare.medVault.repository;

import com.healthcare.medVault.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPatientId(Long patientId);
    List<Review> findByDoctorId(Long doctorId);
    Optional<Review> findByAppointmentId(Long appointmentId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Double findAverageRatingByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.doctor.id = :doctorId")
    Long countByDoctorId(@Param("doctorId") Long doctorId);

    boolean existsByAppointmentId(Long appointmentId);
}