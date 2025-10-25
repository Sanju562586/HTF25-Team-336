package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.PatientProfileDTO;
import com.healthcare.medVault.dto.PatientSummaryDTO;
import com.healthcare.medVault.dto.UserDTO;
import com.healthcare.medVault.entity.Patient;
import com.healthcare.medVault.entity.User;
import com.healthcare.medVault.helper.VerificationStatus;
import com.healthcare.medVault.repository.PatientRepository;
import com.healthcare.medVault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PatientServiceImpl implements PatientService{

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<PatientSummaryDTO> getPendingPatients(){
        List<Patient> patients = patientRepository.findPendingStatus();
        return patients.stream()
                .map(patient -> new PatientSummaryDTO(
                        patient.getId(),
                        patient.getFirstName(),
                        patient.getLastName(),
                        patient.getDateOfBirth(),
                        patient.getGender(),
                        patient.getContactNumber(),
                        patient.getAddress(),
                        patient.getGovernmentIdNumber(),
                        patient.getGovernmentIdUrl(),
                        patient.getStatus()
                ))
                .toList();
    }
    public PatientProfileDTO getPatientProfileByUsername(String username) {
        Patient patient = patientRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        return mapToDTO(patient);
    }


    @Override
    public PatientProfileDTO createPatientProfile(PatientProfileDTO dto) {
        User user = userRepository.findByUsername(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = new Patient();
        patient.setUser(user);
        updateEntityFromDTO(patient, dto);
        user.setProfileCompleted(true);
        return mapToDTO(patientRepository.save(patient));
    }

    @Override
    public PatientProfileDTO updatePatientProfile(Long id, PatientProfileDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        updateEntityFromDTO(patient, dto);

        return mapToDTO(patientRepository.save(patient));
    }

    @Override
    public PatientProfileDTO verifyPatientProfile(Long id, boolean isVerified) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        if (isVerified) {
            patient.setStatus(VerificationStatus.APPROVED);
        } else {
            patient.setStatus(VerificationStatus.REJECTED);
        }

        Patient updatedPatient = patientRepository.save(patient);
        return mapToDTO(updatedPatient);
    }
    // ---- Helpers ----//

    private PatientProfileDTO mapToDTO(Patient patient) {
        User user = patient.getUser();
        PatientProfileDTO dto = new PatientProfileDTO();
        dto.setId(patient.getId());
        dto.setUserId(user.getUsername());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setContactNumber(patient.getContactNumber());
        dto.setAddress(patient.getAddress());
        dto.setEmergencyContact(patient.getEmergencyContact());
        dto.setGovernmentIdNumber(patient.getGovernmentIdNumber());
        dto.setGovernmentIdUrl(patient.getGovernmentIdUrl());
        dto.setStatus(patient.getStatus()); // Add this
        dto.setProfileComplete(user.isProfileCompleted());
    dto.setLatitude(patient.getLatitude());
    dto.setLongitude(patient.getLongitude());

        // Add user info
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setRole(user.getRole().name());
        userDTO.setFirstLogin(user.isFirst_login());
        userDTO.setMessage("");
        userDTO.setProfileComplete(user.isProfileCompleted());
        dto.setUser(userDTO);

        return dto;
    }

    private void updateEntityFromDTO(Patient patient, PatientProfileDTO dto) {
//        String dobString = dto.getDateOfBirth().toString();
//        LocalDate dob = LocalDate.parse(dobString, DateTimeFormatter.ISO_LOCAL_DATE);
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setContactNumber(dto.getContactNumber());
        patient.setAddress(dto.getAddress());
        patient.setEmergencyContact(dto.getEmergencyContact());
        patient.setGovernmentIdNumber(dto.getGovernmentIdNumber());
        patient.setGovernmentIdUrl(dto.getGovernmentIdUrl());
        patient.setLatitude(dto.getLatitude());
        patient.setLongitude(dto.getLongitude());
    }
}
