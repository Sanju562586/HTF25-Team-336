package com.healthcare.medVault.repository;

import com.healthcare.medVault.entity.HealthDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthDocumentRepository extends JpaRepository<HealthDocument, Long> {
    List<HealthDocument> findByPatientId(String patientId);
    Optional<HealthDocument> findByIdAndPatientId(Long id, String patientId);
    void deleteByIdAndPatientId(Long id, String patientId);
}