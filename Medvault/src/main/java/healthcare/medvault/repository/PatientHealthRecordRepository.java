// PatientHealthRecordRepository.java
package com.healthcare.medVault.repository;

import com.healthcare.medVault.entity.PatientHealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientHealthRecordRepository extends JpaRepository<PatientHealthRecord, Long> {
    Optional<PatientHealthRecord> findByPatientId(String patientId);
    boolean existsByPatientId(String patientId);
    void deleteByPatientId(String patientId);
}