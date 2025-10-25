package com.healthcare.medVault.repository;

import com.healthcare.medVault.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByDoctorId(Long doctorId);

    List<Slot> findByDoctorIdAndDateAndIsAvailableTrue(Long doctorId, LocalDate date);

    @Query("SELECT s FROM Slot s WHERE s.doctor.id = :doctorId AND s.date = :date " +
            "AND ((s.timeFrom < :timeTo AND s.timeTo > :timeFrom) OR " +
            "(s.timeFrom = :timeFrom AND s.timeTo = :timeTo))")
    List<Slot> findConflictingSlots(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("timeFrom") LocalTime timeFrom,
            @Param("timeTo") LocalTime timeTo
    );
}