package com.healthcare.medVault.repository;

import com.healthcare.medVault.entity.Patient;
import com.healthcare.medVault.helper.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient,Long>, JpaSpecificationExecutor<Patient> {
    Optional<Patient> findByUserUsername(String username);
    @Query("SELECT p FROM Patient p WHERE p.status = PENDING")
    List<Patient> findPendingStatus();
    Long countByStatus(VerificationStatus status);
}
