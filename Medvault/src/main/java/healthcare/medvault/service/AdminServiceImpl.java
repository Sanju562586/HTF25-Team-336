package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.Doctor;
import com.healthcare.medVault.entity.Patient;
import com.healthcare.medVault.helper.VerificationStatus;
import com.healthcare.medVault.repository.DoctorRepository;
import com.healthcare.medVault.repository.PatientRepository;
import com.healthcare.medVault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<DoctorResponse> getDoctors(int page, int limit, String search) {
        try {
            Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("id").descending());
            Page<Doctor> doctorPage = searchDoctors(search, pageable);

            List<DoctorResponse> doctorResponses = doctorPage.getContent()
                    .stream()
                    .map(this::convertToDoctorResponse)
                    .collect(Collectors.toList());

            PaginationMeta paginationMeta = createPaginationMeta(doctorPage, page, limit);

            return new PaginationResponse<>(doctorResponses, paginationMeta);
        } catch (Exception e) {
            log.error("Error fetching doctors: {}", e.getMessage(), e);
            return createEmptyDoctorResponse();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<PatientResponse> getPatients(int page, int limit, String search) {
        try {
            Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("id").descending());
            Page<Patient> patientPage = searchPatients(search, pageable);

            List<PatientResponse> patientResponses = patientPage.getContent()
                    .stream()
                    .map(this::convertToPatientResponse)
                    .collect(Collectors.toList());

            PaginationMeta paginationMeta = createPaginationMeta(patientPage, page, limit);

            return new PaginationResponse<>(patientResponses, paginationMeta);
        } catch (Exception e) {
            log.error("Error fetching patients: {}", e.getMessage(), e);
            return createEmptyPatientResponse();
        }
    }

    @Override
    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id).orElseThrow(()->new RuntimeException("Doctor Not Found!"));
//        if (!doctorRepository.existsById(id)) {
//            throw new RuntimeException("Doctor not found with id: " + id);
//        }
        doctorRepository.deleteById(id);
        userRepository.deleteById(doctor.getUser().getId());
        log.info("Doctor deleted successfully with id: {}", id);
    }

    @Override
    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id).orElseThrow(()->new RuntimeException("Patient Not Found."));
//        if (!patientRepository.existsById(id)) {
//            throw new RuntimeException("Patient not found with id: " + id);
//        }
        patientRepository.deleteById(id);
        userRepository.deleteById(patient.getUser().getId());
        log.info("Patient deleted successfully with id: {}", id);
    }

    // Private helper methods
    private Page<Doctor> searchDoctors(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = "%" + search.toLowerCase() + "%";
            Specification<Doctor> spec = (root, query, criteriaBuilder) -> {
                List<Predicate> predicates = new ArrayList<>();

                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), searchTerm),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), searchTerm),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("specialization")), searchTerm),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("department")), searchTerm),
                        criteriaBuilder.like(root.get("medicalCouncilRegistrationNumber"), searchTerm)
                ));

                return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
            };
            return doctorRepository.findAll(spec, pageable);
        } else {
            return doctorRepository.findAll(pageable);
        }
    }

    private Page<Patient> searchPatients(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = "%" + search.toLowerCase() + "%";
            Specification<Patient> spec = (root, query, criteriaBuilder) -> {
                List<Predicate> predicates = new ArrayList<>();

                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), searchTerm),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), searchTerm),
                        criteriaBuilder.like(root.get("contactNumber"), searchTerm)
                ));

                return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
            };
            return patientRepository.findAll(spec, pageable);
        } else {
            return patientRepository.findAll(pageable);
        }
    }

    private DoctorResponse convertToDoctorResponse(Doctor doctor) {
        DoctorResponse response = new DoctorResponse();
        response.setId(doctor.getId().toString());
        response.setFirstName(doctor.getFirstName());
        response.setLastName(doctor.getLastName());
        response.setEmail(doctor.getUser() != null ? doctor.getUser().getUsername() : "");
        response.setContactNumber(doctor.getContactNumber());
        response.setLatitude(doctor.getLatitude());
        response.setLongitude(doctor.getLongitude());
        response.setSpecialization(parseSpecialization(doctor.getSpecialization()));
        response.setDepartment(doctor.getDepartment());
        response.setYearsOfExperience(doctor.getYearsOfExperience());
        response.setLicenseNumber(doctor.getMedicalCouncilRegistrationNumber());
        response.setStatus(doctor.getStatus() != null ? doctor.getStatus() : VerificationStatus.PENDING);
        response.setCreatedAt(doctor.getUser() != null ? doctor.getUser().getCreatedAt() : null);
        return response;
    }

    private PatientResponse convertToPatientResponse(Patient patient) {
        PatientResponse response = new PatientResponse();
        response.setId(patient.getId().toString());
        response.setFirstName(patient.getFirstName());
        response.setLastName(patient.getLastName());
        response.setEmail(patient.getUser() != null ? patient.getUser().getUsername() : "");
        response.setContactNumber(patient.getContactNumber());
        response.setLatitude(patient.getLatitude());
        response.setLongitude(patient.getLongitude());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setGender(patient.getGender());
        response.setAddress(patient.getAddress());
        response.setStatus(patient.getStatus() != null ? patient.getStatus() : VerificationStatus.PENDING);
        response.setCreatedAt(patient.getUser() != null ? patient.getUser().getCreatedAt() : null);
        return response;
    }

    private List<String> parseSpecialization(String specialization) {
        if (specialization == null || specialization.trim().isEmpty()) {
            return List.of();
        }
        return List.of(specialization.split(",\\s*"));
    }

    private PaginationMeta createPaginationMeta(Page<?> page, int currentPage, int itemsPerPage) {
        return new PaginationMeta(
                currentPage,
                page.getTotalPages(),
                page.getTotalElements(),
                itemsPerPage
        );
    }

    private PaginationResponse<DoctorResponse> createEmptyDoctorResponse() {
        return new PaginationResponse<>(
                List.of(),
                new PaginationMeta(1, 1, 0, 10)
        );
    }

    private PaginationResponse<PatientResponse> createEmptyPatientResponse() {
        return new PaginationResponse<>(
                List.of(),
                new PaginationMeta(1, 1, 0, 10)
        );
    }
}