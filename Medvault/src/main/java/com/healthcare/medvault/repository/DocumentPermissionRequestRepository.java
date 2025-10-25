package com.healthcare.medVault.repository;

import com.healthcare.medVault.entity.DocumentPermissionRequest;
import com.healthcare.medVault.helper.DocumentPermissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentPermissionRequestRepository extends JpaRepository<DocumentPermissionRequest, Long> {

    List<DocumentPermissionRequest> findByAppointmentIdAndStatus(Long appointmentId, DocumentPermissionStatus status);

    List<DocumentPermissionRequest> findByPatientIdAndStatus(Long patientId, DocumentPermissionStatus status);

    List<DocumentPermissionRequest> findByPatientId(Long patientId);

    Optional<DocumentPermissionRequest> findByRequestId(String requestId);

    List<DocumentPermissionRequest> findByDoctorIdAndAppointmentId(Long doctorId, Long appointmentId);

    Optional<DocumentPermissionRequest> findByDocumentIdAndAppointmentId(Long documentId, Long appointmentId);

    @Query("SELECT dpr FROM DocumentPermissionRequest dpr WHERE dpr.patient.id = :patientId AND dpr.status = 'PENDING'")
    List<DocumentPermissionRequest> findPendingRequestsByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT dpr FROM DocumentPermissionRequest dpr WHERE dpr.expiresAt < :now AND dpr.isExpired = false")
    List<DocumentPermissionRequest> findExpiredPermissions(@Param("now") LocalDateTime now);
}