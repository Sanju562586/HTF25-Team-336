package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.DepartmentDistributionDTO;
import com.healthcare.medVault.dto.MonthlyAppointmentsDTO;
import com.healthcare.medVault.dto.PatientsPerDoctorDTO;
import com.healthcare.medVault.dto.UserStatsDTO;
import com.healthcare.medVault.helper.VerificationStatus;
import com.healthcare.medVault.repository.AppointmentRepository;
import com.healthcare.medVault.repository.DoctorRepository;
import com.healthcare.medVault.repository.PatientRepository;
import com.healthcare.medVault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class AnalyticsServiceImpl implements AnalyticsService{
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Override
    public UserStatsDTO getUserStats() {
        return new UserStatsDTO(
                userRepository.count(),
                doctorRepository.count(),
                patientRepository.count(),
                appointmentRepository.count(),
                patientRepository.countByStatus(VerificationStatus.PENDING) + doctorRepository.countByStatus(VerificationStatus.PENDING)
        );
    }

    @Override
    public List<MonthlyAppointmentsDTO> getMonthlyAppointments() {
        List<Object[]> results = appointmentRepository.getAppointmentsPerMonthRaw();

        return results.stream()
                .map(row -> new MonthlyAppointmentsDTO(
                        ((Number) row[0]).longValue(),
                        ((Number) row[1]).longValue()
                ))
                .toList();
    }

    @Override
    public List<PatientsPerDoctorDTO> getPatientsPerDoctor() {
        return appointmentRepository.getPatientsPerDoctor();
    }

    @Override
    public List<DepartmentDistributionDTO> getDepartmentDistribution() {
        return doctorRepository.getDepartmentDistribution();
    }
}
