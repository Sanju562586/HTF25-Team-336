package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.*;
import com.healthcare.medVault.helper.EmergencyStatus;
import com.healthcare.medVault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmergencyService {

    private final EmergencyRequestRepository emergencyRequestRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final RejectionRepository rejectionRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    public boolean getDoctorAvailability(String doctorId) {
        Optional<DoctorAvailability> availability = doctorAvailabilityRepository.findByDoctorId(Long.parseLong(doctorId));
        return availability.map(DoctorAvailability::getIsAvailable).orElse(false);
    }

    @Transactional
    public EmergencyRequestDTO createEmergencyRequest(CreateEmergencyRequestDTO requestDTO) {
        Patient patient = patientRepository.findById(Long.parseLong(requestDTO.getPatientId()))
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        EmergencyRequest emergencyRequest = new EmergencyRequest();
        emergencyRequest.setPatient(patient);
        emergencyRequest.setPatientName(patient.getFirstName() + " " + patient.getLastName());
        emergencyRequest.setPatientPhone(patient.getContactNumber());
        emergencyRequest.setSymptoms(requestDTO.getSymptoms());
        emergencyRequest.setUrgencyLevel(requestDTO.getUrgencyLevel());
        emergencyRequest.setLocation(requestDTO.getLocation());
        emergencyRequest.setNotes(requestDTO.getNotes());
        emergencyRequest.setStatus(EmergencyStatus.PENDING);

        EmergencyRequest savedRequest = emergencyRequestRepository.save(emergencyRequest);
        return convertToDTO(savedRequest);
    }

    public List<EmergencyRequestDTO> getPatientEmergencyRequests(String patientId) {
        List<EmergencyRequest> requests = emergencyRequestRepository.findByPatientIdOrderByCreatedAtDesc(Long.parseLong(patientId));
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void cancelEmergencyRequest(String requestId) {
        EmergencyRequest request = emergencyRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found"));

        if (request.getStatus() != EmergencyStatus.PENDING) {
            throw new RuntimeException("Cannot cancel request that is not pending");
        }

        emergencyRequestRepository.delete(request);
    }

    public List<DoctorAvailabilityDTO> getAvailableDoctors() {
        List<DoctorAvailability> availableDoctors = doctorAvailabilityRepository.findByIsAvailableTrue();
        return availableDoctors.stream().map(this::convertToAvailabilityDTO).collect(Collectors.toList());
    }

    @Transactional
    public void updateDoctorAvailability(String doctorId, Boolean isAvailable) {
        Doctor doctor = doctorRepository.findById(Long.parseLong(doctorId))
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        DoctorAvailability availability = doctorAvailabilityRepository.findByDoctorId(doctor.getId())
                .orElse(new DoctorAvailability());

        availability.setDoctor(doctor);
        availability.setIsAvailable(isAvailable);

        doctorAvailabilityRepository.save(availability);
    }

    public List<EmergencyRequestDTO> getPendingEmergencyRequests() {
        List<EmergencyRequest> requests = emergencyRequestRepository.findByStatusOrderByCreatedAtDesc(EmergencyStatus.PENDING);
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<EmergencyRequestDTO> getPendingEmergencyRequestsWithDid(String dId) {
        List<EmergencyRequest> requests = emergencyRequestRepository.findByStatusOrderByCreatedAtDesc(EmergencyStatus.PENDING);
        List<EmergencyRequest> pendingRequests = new ArrayList<>();
        for(EmergencyRequest request : requests){
            if(rejectionRepository.findById(new RejectionId(request.getId(),Long.parseLong(dId))).isPresent()){
                pendingRequests.add(request);
            }
        }
        requests.removeAll(pendingRequests);
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<EmergencyRequestDTO> getDoctorEmergencyRequests(String doctorId) {
        List<EmergencyRequest> requests = emergencyRequestRepository.findByDoctorIdOrderByCreatedAtDesc(Long.parseLong(doctorId));
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public EmergencyRequestDTO acceptEmergencyRequest(String doctorId,String requestId) {
        EmergencyRequest request = emergencyRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found"));

        if (request.getStatus() != EmergencyStatus.PENDING) {
            throw new RuntimeException("Request is not in pending status");
        }
        Doctor doctor = doctorRepository.findById(Long.parseLong(doctorId))
                .orElseThrow(()->new RuntimeException("Doctor not found"));

        request.setDoctor(doctor);
        request.setStatus(EmergencyStatus.ACCEPTED);

        EmergencyRequest updatedRequest = emergencyRequestRepository.save(request);
        return convertToDTO(updatedRequest);
    }

    @Transactional
    public void rejectEmergencyRequest(String doctorId,String requestId, RejectEmergencyRequestDTO rejectDTO) {
        EmergencyRequest request = emergencyRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found"));

        if (request.getStatus() != EmergencyStatus.PENDING) {
            throw new RuntimeException("Request is not in pending status");
        }
        Rejection rejection = new Rejection();
        RejectionId rejectionId = new RejectionId(request.getId(),Long.parseLong(doctorId));
        rejection.setRejectionId(rejectionId);
        rejection.setReason(rejectDTO.getReason());
        rejectionRepository.save(rejection);
    }

    @Transactional
    public EmergencyRequestDTO completeEmergencyRequest(String requestId, CompleteEmergencyRequestDTO completeDTO) {
        EmergencyRequest request = emergencyRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found"));

        if (request.getStatus() != EmergencyStatus.ACCEPTED) {
            throw new RuntimeException("Request must be accepted before completion");
        }

        request.setStatus(EmergencyStatus.COMPLETED);
        request.setNotes(completeDTO.getNotes());

        EmergencyRequest updatedRequest = emergencyRequestRepository.save(request);
        return convertToDTO(updatedRequest);
    }

    public EmergencyStatsDTO getEmergencyStats() {
        EmergencyStatsDTO stats = new EmergencyStatsDTO();

        stats.setTotalRequests(emergencyRequestRepository.count());
        stats.setPendingRequests(emergencyRequestRepository.countByStatus(EmergencyStatus.PENDING));
        stats.setAcceptedRequests(emergencyRequestRepository.countByStatus(EmergencyStatus.ACCEPTED));
        stats.setCompletedRequests(emergencyRequestRepository.countByStatus(EmergencyStatus.COMPLETED));

        Double avgResponseTime = emergencyRequestRepository.findAverageResponseTime();
        stats.setAverageResponseTime(avgResponseTime != null ? avgResponseTime : 0.0);

        return stats;
    }

    private EmergencyRequestDTO convertToDTO(EmergencyRequest request) {
        EmergencyRequestDTO dto = new EmergencyRequestDTO();
        dto.setId(request.getRequestId());
        dto.setPatientId(request.getPatient().getId().toString());
        dto.setPatientName(request.getPatientName());
        dto.setPatientPhone(request.getPatientPhone());
        dto.setSymptoms(request.getSymptoms());
        dto.setUrgencyLevel(request.getUrgencyLevel());
        dto.setLocation(request.getLocation());
        dto.setStatus(request.getStatus().name());
        dto.setCreatedAt(request.getCreatedAt().format(formatter));
        dto.setUpdatedAt(request.getUpdatedAt().format(formatter));
        dto.setNotes(request.getNotes());

        if (request.getDoctor() != null) {
            dto.setDoctorId(request.getDoctor().getId().toString());
            dto.setDoctorName(request.getDoctor().getFirstName() + " " + request.getDoctor().getLastName());
            dto.setAcceptedBy(request.getDoctor().getFirstName() + " " + request.getDoctor().getLastName());
        }

        return dto;
    }

    private DoctorAvailabilityDTO convertToAvailabilityDTO(DoctorAvailability availability) {
        DoctorAvailabilityDTO dto = new DoctorAvailabilityDTO();
        dto.setDoctorId(availability.getDoctor().getId());
        dto.setDoctorName(availability.getDoctor().getFirstName() + " " + availability.getDoctor().getLastName());
        dto.setSpecialization(availability.getDoctor().getSpecialization());
        dto.setIsAvailable(availability.getIsAvailable());
        dto.setCurrentLocation(availability.getCurrentLocation());
        return dto;
    }
}