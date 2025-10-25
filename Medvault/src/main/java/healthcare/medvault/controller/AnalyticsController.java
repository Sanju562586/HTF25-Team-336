package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.DepartmentDistributionDTO;
import com.healthcare.medVault.dto.MonthlyAppointmentsDTO;
import com.healthcare.medVault.dto.PatientsPerDoctorDTO;
import com.healthcare.medVault.dto.UserStatsDTO;
import com.healthcare.medVault.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/user-stats")
    public UserStatsDTO getUserStats() {
        return analyticsService.getUserStats();
    }

    @GetMapping("/appointments/monthly")
    public List<MonthlyAppointmentsDTO> getMonthlyAppointments() {
        return analyticsService.getMonthlyAppointments();
    }

    @GetMapping("/patients-per-doctor")
    public List<PatientsPerDoctorDTO> getPatientsPerDoctor() {
        return analyticsService.getPatientsPerDoctor();
    }

    @GetMapping("/department-distribution")
    public List<DepartmentDistributionDTO> getDepartmentDistribution() {
        return analyticsService.getDepartmentDistribution();
    }

}

