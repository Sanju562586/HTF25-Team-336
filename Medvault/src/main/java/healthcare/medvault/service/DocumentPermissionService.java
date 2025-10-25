package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.*;
import java.util.List;

public interface DocumentPermissionService {

    DocumentPermissionRequestDTO requestDocumentPermission(String appointmentId, String documentId, String requestMessage);

    DocumentPermissionRequestDTO respondToPermissionRequest(String permissionRequestId, DocumentPermissionResponseDTO response);

    PatientMedicalRecordAccessDTO getPatientMedicalRecord(String appointmentId);

    List<DocumentPermissionRequestDTO> getPatientPermissionRequests(String patientId);

    List<DoctorDocumentAccessDTO> getDoctorDocumentAccess(String appointmentId);

    void revokeDocumentPermission(String permissionRequestId);

    DoctorDocumentAccessDTO checkDocumentAccess(String documentId, String appointmentId);

    void cleanupExpiredPermissions();
}