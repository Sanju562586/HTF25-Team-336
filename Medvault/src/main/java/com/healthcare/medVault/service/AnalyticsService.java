package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.DepartmentDistributionDTO;
import com.healthcare.medVault.dto.MonthlyAppointmentsDTO;
import com.healthcare.medVault.dto.PatientsPerDoctorDTO;
import com.healthcare.medVault.dto.UserStatsDTO;

import java.util.List;
import java.util.Map;

public interface AnalyticsService {
    public UserStatsDTO getUserStats();
    public List<MonthlyAppointmentsDTO> getMonthlyAppointments();
    public List<PatientsPerDoctorDTO> getPatientsPerDoctor();
    public List<DepartmentDistributionDTO> getDepartmentDistribution();
}
