package com.healthcare.medVault.repository;

import com.healthcare.medVault.entity.EmergencyRequest;
import com.healthcare.medVault.helper.EmergencyStatus;
import com.healthcare.medVault.helper.UrgencyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {

    Optional<EmergencyRequest> findByRequestId(String requestId);

    List<EmergencyRequest> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<EmergencyRequest> findByStatusOrderByCreatedAtDesc(EmergencyStatus status);

    List<EmergencyRequest> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    List<EmergencyRequest> findByDoctorIdAndStatusOrderByCreatedAtDesc(Long doctorId, EmergencyStatus status);

    @Query("SELECT COUNT(e) FROM EmergencyRequest e WHERE e.createdAt >= :startDate")
    Long countByCreatedAtAfter(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(e) FROM EmergencyRequest e WHERE e.status = :status")
    Long countByStatus(@Param("status") EmergencyStatus status);

    @Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, e.createdAt, e.updatedAt)) FROM EmergencyRequest e WHERE e.status = 'COMPLETED'")
    Double findAverageResponseTime();

    List<EmergencyRequest> findByUrgencyLevelAndStatus(UrgencyLevel urgencyLevel, EmergencyStatus status);
}


