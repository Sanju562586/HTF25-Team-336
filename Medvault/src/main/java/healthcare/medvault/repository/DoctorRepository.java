package com.healthcare.medVault.repository;

import com.healthcare.medVault.dto.DepartmentDistributionDTO;
import com.healthcare.medVault.entity.Doctor;
import com.healthcare.medVault.entity.Patient;
import com.healthcare.medVault.entity.User;
import com.healthcare.medVault.helper.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor,Long>, JpaSpecificationExecutor<Doctor> {
    @Query("SELECT new com.healthcare.medVault.dto.DepartmentDistributionDTO(d.department, COUNT(d)) " +
            "FROM Doctor d GROUP BY d.department")
    List<DepartmentDistributionDTO> getDepartmentDistribution();

    Optional<Doctor> findByUser(User user);

    Long countByStatus(VerificationStatus status);

    List<Doctor> findByStatus(VerificationStatus status);
}
