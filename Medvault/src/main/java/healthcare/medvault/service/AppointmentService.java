package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.AppointmentRequestDTO;
import com.healthcare.medVault.dto.AppointmentRescheduleDTO;
import com.healthcare.medVault.dto.AppointmentResponseDTO;
import com.healthcare.medVault.dto.AppointmentStatusUpdateDTO;

import java.util.List;

public interface AppointmentService {
    AppointmentResponseDTO bookAppointment(AppointmentRequestDTO appointmentRequestDTO);
    AppointmentResponseDTO getAppointmentById(Long id);
    List<AppointmentResponseDTO> getAppointmentsByPatientId(Long patientId);
    List<AppointmentResponseDTO> getAppointmentsByDoctorId(Long doctorId);
    AppointmentResponseDTO updateAppointmentStatus(Long id, AppointmentStatusUpdateDTO statusUpdateDTO);
    AppointmentResponseDTO rescheduleAppointment(Long id, AppointmentRescheduleDTO rescheduleDTO);
    List<AppointmentResponseDTO> getAllAppointments();
    void deleteAppointment(Long id);
}