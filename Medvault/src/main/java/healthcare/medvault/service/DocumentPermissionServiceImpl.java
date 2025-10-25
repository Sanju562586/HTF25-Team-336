package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.*;
import com.healthcare.medVault.helper.DocumentPermissionStatus;
import com.healthcare.medVault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentPermissionServiceImpl implements DocumentPermissionService{

    private final DocumentPermissionRequestRepository permissionRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final HealthDocumentRepository healthDocumentRepository;
    private final PatientHealthRecordRepository healthRecordRepository;

    @Autowired
    private PatientHealthRecordServiceImpl patientHealthRecordService;

    @Override
    @Transactional
    public DocumentPermissionRequestDTO requestDocumentPermission(String appointmentId, String documentId, String requestMessage) {
        Appointment appointment = appointmentRepository.findById(Long.parseLong(appointmentId))
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        HealthDocument document = healthDocumentRepository.findById(Long.parseLong(documentId))
                .orElseThrow(() -> new RuntimeException("Document not found"));

        DocumentPermissionRequest permissionRequest = new DocumentPermissionRequest();
        permissionRequest.setAppointment(appointment);
        permissionRequest.setDoctor(appointment.getDoctor());
        permissionRequest.setPatient(appointment.getPatient());
        permissionRequest.setDocument(document);
        permissionRequest.setDocumentName(document.getName());
        permissionRequest.setDocumentType(document.getType().name());
        permissionRequest.setRequestMessage(requestMessage);
        permissionRequest.setStatus(DocumentPermissionStatus.PENDING);

        DocumentPermissionRequest savedRequest = permissionRepository.save(permissionRequest);
        return convertToDTO(savedRequest);
    }

    @Override
    @Transactional
    public DocumentPermissionRequestDTO respondToPermissionRequest(String permissionRequestId, DocumentPermissionResponseDTO response) {
        DocumentPermissionRequest permissionRequest = permissionRepository.findByRequestId(permissionRequestId)
                .orElseThrow(() -> new RuntimeException("Permission request not found"));

        DocumentPermissionStatus status = DocumentPermissionStatus.valueOf(response.getResponse());
        permissionRequest.setStatus(status);
        permissionRequest.setRespondedAt(LocalDateTime.now());

        if (status == DocumentPermissionStatus.APPROVED) {
            permissionRequest.setExpiresAt(LocalDateTime.now().plusHours(12));
            permissionRequest.setIsExpired(false);
        } else {
            permissionRequest.setIsExpired(true);
        }

        DocumentPermissionRequest updatedRequest = permissionRepository.save(permissionRequest);
        return convertToDTO(updatedRequest);
    }

    @Override
    public PatientMedicalRecordAccessDTO getPatientMedicalRecord(String appointmentId) {
        Appointment appointment = appointmentRepository.findById(Long.parseLong(appointmentId))
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Patient patient = appointment.getPatient();
        List<DocumentPermissionRequest> permissions = permissionRepository.findByAppointmentIdAndStatus(appointment.getId(), DocumentPermissionStatus.APPROVED);

        PatientMedicalRecordAccessDTO response = new PatientMedicalRecordAccessDTO();
        response.setAppointmentId(appointmentId);
        response.setPatientId(patient.getId().toString());
        response.setPatientName(patient.getFirstName() + " " + patient.getLastName());
        response.setAppointmentDate(appointment.getAppointmentDateTime().toString());
        response.setHasBasicAccess(true);
        response.setDocumentPermissions(permissions.stream().map(this::convertToDTO).collect(Collectors.toList()));

        Optional<PatientHealthRecord> healthRecordOpt = healthRecordRepository.findByPatientId(patient.getId().toString());

        if (healthRecordOpt.isPresent()) {
            PatientHealthRecord healthRecord = healthRecordOpt.get();
            PatientHealthRecordDTO healthRecordDTO = patientHealthRecordService.convertToDTO(healthRecord);

            PatientMedicalRecordAccessDTO.MedicalRecord medicalRecord = new PatientMedicalRecordAccessDTO.MedicalRecord();
            medicalRecord.setBasicDemographics(healthRecordDTO.getBasicDemographics());
            medicalRecord.setMedicalHistory(healthRecordDTO.getMedicalHistory());
            medicalRecord.setLifestyle(healthRecordDTO.getLifestyle());
            medicalRecord.setCurrentHealth(healthRecordDTO.getCurrentHealth());
            medicalRecord.setDocuments(healthRecordDTO.getDocuments());

            response.setMedicalRecord(medicalRecord);
        }
        return response;
    }

    @Override
    public List<DocumentPermissionRequestDTO> getPatientPermissionRequests(String patientId) {
        Patient patient = patientRepository.findByUserUsername(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        List<DocumentPermissionRequest> requests = permissionRepository.findByPatientId(patient.getId());
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<DoctorDocumentAccessDTO> getDoctorDocumentAccess(String appointmentId) {

        List<DocumentPermissionRequest> permissions = permissionRepository.findByAppointmentIdAndStatus(
                Long.parseLong(appointmentId),DocumentPermissionStatus.APPROVED);

        return permissions.stream().map(this::convertToAccessDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void revokeDocumentPermission(String permissionRequestId) {
        DocumentPermissionRequest permissionRequest = permissionRepository.findByRequestId(permissionRequestId)
                .orElseThrow(() -> new RuntimeException("Permission request not found"));

        permissionRequest.setIsExpired(true);
        permissionRequest.setStatus(DocumentPermissionStatus.REJECTED);
        permissionRequest.setUpdatedAt(LocalDateTime.now());

        permissionRepository.save(permissionRequest);
    }

    @Override
    public DoctorDocumentAccessDTO checkDocumentAccess(String documentId, String appointmentId) {
        Optional<DocumentPermissionRequest> permissionOpt = permissionRepository.findByDocumentIdAndAppointmentId(
                Long.parseLong(documentId), Long.parseLong(appointmentId));

        DoctorDocumentAccessDTO accessDTO = new DoctorDocumentAccessDTO();
        accessDTO.setDocumentId(documentId);

        if (permissionOpt.isPresent()) {
            DocumentPermissionRequest permission = permissionOpt.get();
            accessDTO.setPermissionId(permission.getRequestId());
            accessDTO.setCanView(permission.getStatus() == DocumentPermissionStatus.APPROVED && !permission.getIsExpired());

            if (permission.getExpiresAt() != null) {
                accessDTO.setExpiresAt(permission.getExpiresAt());
                long minutesRemaining = ChronoUnit.MINUTES.between(LocalDateTime.now(), permission.getExpiresAt());
                accessDTO.setTimeRemaining(Math.max(0, minutesRemaining));
            }
        } else {
            accessDTO.setCanView(false);
        }

        return accessDTO;
    }

    @Override
    @Transactional
    public void cleanupExpiredPermissions() {
        List<DocumentPermissionRequest> expiredPermissions = permissionRepository.findExpiredPermissions(LocalDateTime.now());

        for (DocumentPermissionRequest permission : expiredPermissions) {
            permission.setIsExpired(true);
        }

        permissionRepository.saveAll(expiredPermissions);
    }

    private DocumentPermissionRequestDTO convertToDTO(DocumentPermissionRequest request) {
        DocumentPermissionRequestDTO dto = new DocumentPermissionRequestDTO();
        dto.setId(request.getRequestId());
        dto.setAppointmentId(request.getAppointment().getId().toString());
        dto.setDoctorId(request.getDoctor().getId().toString());
        dto.setDoctorName(request.getDoctor().getFirstName()+" "+request.getDoctor().getLastName());
        dto.setPatientId(request.getPatient().getId().toString());
        dto.setDocumentId(request.getDocument().getId().toString());
        dto.setDocumentName(request.getDocumentName());
        dto.setDocumentType(request.getDocumentType());
        dto.setRequestMessage(request.getRequestMessage());
        dto.setStatus(request.getStatus().name());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setRespondedAt(request.getRespondedAt());
        dto.setExpiresAt(request.getExpiresAt());
        dto.setIsExpired(request.getIsExpired());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }

    private DoctorDocumentAccessDTO convertToAccessDTO(DocumentPermissionRequest request) {
        DoctorDocumentAccessDTO dto = new DoctorDocumentAccessDTO();
        dto.setDocumentId(request.getDocument().getId().toString());
        dto.setPermissionId(request.getRequestId());
        dto.setCanView(request.getStatus() == DocumentPermissionStatus.APPROVED && !request.getIsExpired());
        dto.setExpiresAt(request.getExpiresAt());

        if (request.getExpiresAt() != null) {
            long minutesRemaining = ChronoUnit.MINUTES.between(LocalDateTime.now(), request.getExpiresAt());
            dto.setTimeRemaining(Math.max(0, minutesRemaining));
        }

        return dto;
    }
}