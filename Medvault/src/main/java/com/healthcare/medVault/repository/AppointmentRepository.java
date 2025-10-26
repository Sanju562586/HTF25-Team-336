package com.healthcare.medVault.repository;

import com.healthcare.medVault.dto.MonthlyAppointmentsDTO;
import com.healthcare.medVault.dto.PatientsPerDoctorDTO;
import com.healthcare.medVault.entity.Appointment;
import com.healthcare.medVault.helper.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment,Long> {
    @Query(
            value = "SELECT DATE_FORMAT(a.appointment_datetime, '%Y-%m') AS month, COUNT(*) AS appointmentCount " +
                    "FROM appointments a " +
                    "GROUP BY DATE_FORMAT(a.appointment_datetime, '%Y-%m') " +
                    "ORDER BY month",
            nativeQuery = true)
    List<Object[]> getAppointmentsPerMonthRaw();

    @Query("SELECT new com.healthcare.medVault.dto.PatientsPerDoctorDTO(CAST(d.id as string), COUNT(a)) " +
            "FROM Appointment a " +
            "JOIN a.doctor d " +
            "GROUP BY d.id")
    List<PatientsPerDoctorDTO> getPatientsPerDoctor();

    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    boolean existsBySlotId(Long slotId);

    //For reviews
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.status = :status")
    List<Appointment> findByPatientIdAndStatus(@Param("patientId") Long patientId,
                                               @Param("status") AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
    List<Appointment> findByDoctorIdAndStatus(@Param("doctorId") Long doctorId,
                                              @Param("status") AppointmentStatus status);
}
