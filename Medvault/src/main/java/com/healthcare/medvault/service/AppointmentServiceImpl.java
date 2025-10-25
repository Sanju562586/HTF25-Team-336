package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.AppointmentRequestDTO;
import com.healthcare.medVault.dto.AppointmentRescheduleDTO;
import com.healthcare.medVault.dto.AppointmentResponseDTO;
import com.healthcare.medVault.dto.AppointmentStatusUpdateDTO;
import com.healthcare.medVault.entity.Appointment;
import com.healthcare.medVault.entity.Doctor;
import com.healthcare.medVault.entity.Patient;
import com.healthcare.medVault.entity.Slot;
import com.healthcare.medVault.exception.ResourceNotFoundException;
import com.healthcare.medVault.helper.AppointmentStatus;
import com.healthcare.medVault.repository.AppointmentRepository;
import com.healthcare.medVault.repository.DoctorRepository;
import com.healthcare.medVault.repository.PatientRepository;
import com.healthcare.medVault.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final SlotRepository slotRepository;

    @Override
    @Transactional
    public AppointmentResponseDTO rescheduleAppointment(Long id, AppointmentRescheduleDTO rescheduleDTO) {
        // Find the existing appointment
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        // Validate that the appointment can be rescheduled
        if (appointment.getStatus() != AppointmentStatus.PENDING && appointment.getStatus() != AppointmentStatus.APPROVED) {
            throw new IllegalStateException("Only PENDING or APPROVED appointments can be rescheduled");
        }

        // Check if the appointment has already been rescheduled (based on your business rules)
        // You might want to add a rescheduleCount field to the Appointment entity to track this

        // Validate the new time slot
        Slot newSlot = slotRepository.findById(rescheduleDTO.getNewTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + rescheduleDTO.getNewTimeSlotId()));

        // Check if the new slot is available
        if (!newSlot.getIsAvailable()) {
            throw new IllegalStateException("The selected time slot is not available");
        }

        // Check if the new slot belongs to the same doctor
        if (!newSlot.getDoctor().getId().equals(appointment.getDoctor().getId())) {
            throw new IllegalStateException("The selected time slot does not belong to the same doctor");
        }

        // Free up the old slot
        Slot oldSlot = appointment.getSlot();
        oldSlot.setIsAvailable(true);
        slotRepository.save(oldSlot);

        // Reserve the new slot
        newSlot.setIsAvailable(false);
        slotRepository.save(newSlot);

        // Update the appointment with the new slot
        appointment.setSlot(newSlot);
        appointment.setUpdatedAt(LocalDateTime.now());

        // If the appointment was approved, you might want to change its status back to PENDING
        // depending on your business rules
        if (appointment.getStatus() == AppointmentStatus.APPROVED) {
            appointment.setStatus(AppointmentStatus.PENDING);
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return convertToDTO(updatedAppointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO appointmentRequestDTO) {
        // Validate patient exists
        Patient patient = patientRepository.findById(appointmentRequestDTO.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + appointmentRequestDTO.getPatientId()));

        // Validate doctor exists
        Doctor doctor = doctorRepository.findById(appointmentRequestDTO.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + appointmentRequestDTO.getDoctorId()));

        // Validate slot exists and is available
        Slot slot = slotRepository.findById(appointmentRequestDTO.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + appointmentRequestDTO.getSlotId()));

        if (!slot.getIsAvailable()) {
            throw new IllegalStateException("Slot is not available for booking");
        }

        // Check if slot belongs to the doctor
        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalStateException("Slot does not belong to the specified doctor");
        }

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setNotes(appointmentRequestDTO.getNotes());

        // Mark slot as unavailable
        slot.setIsAvailable(false);
        slotRepository.save(slot);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return convertToDTO(savedAppointment);
    }

    @Override
    public AppointmentResponseDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return convertToDTO(appointment);
    }

    @Override
    public List<AppointmentResponseDTO> getAppointmentsByPatientId(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }

        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDTO> getAppointmentsByDoctorId(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + doctorId);
        }

        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponseDTO updateAppointmentStatus(Long id, AppointmentStatusUpdateDTO statusUpdateDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        appointment.setStatus(statusUpdateDTO.getStatus());

        if (statusUpdateDTO.getNotes() != null) {
            appointment.setNotes(statusUpdateDTO.getNotes());
        }

        // If appointment is rejected, make the slot available again
        if (statusUpdateDTO.getStatus() == AppointmentStatus.REJECTED) {
            Slot slot = appointment.getSlot();
            slot.setIsAvailable(true);
            slotRepository.save(slot);
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return convertToDTO(updatedAppointment);
    }

    @Override
    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        // Make the slot available again
        Slot slot = appointment.getSlot();
        slot.setIsAvailable(true);
        slotRepository.save(slot);

        appointmentRepository.delete(appointment);
    }

    private AppointmentResponseDTO convertToDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setSlotId(appointment.getSlot().getId());
        dto.setPatientName(appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName());
        dto.setDoctorName("Dr. " + appointment.getDoctor().getFirstName() + " " + appointment.getDoctor().getLastName());
        dto.setSpecialization(String.join(", ", appointment.getDoctor().getSpecialization()));
        dto.setDate(appointment.getSlot().getDate());
        dto.setTimeFrom(appointment.getSlot().getTimeFrom());
        dto.setTimeTo(appointment.getSlot().getTimeTo());
        dto.setStatus(appointment.getStatus());
        dto.setNotes(appointment.getNotes());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());

        return dto;
    }
}