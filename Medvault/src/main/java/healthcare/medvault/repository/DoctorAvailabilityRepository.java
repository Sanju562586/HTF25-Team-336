package com.healthcare.medVault.repository;

import com.healthcare.medVault.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    Optional<DoctorAvailability> findByDoctorId(Long doctorId);

    List<DoctorAvailability> findByIsAvailableTrue();

}
