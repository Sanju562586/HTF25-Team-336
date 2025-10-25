package com.healthcare.medVault.service;

import com.healthcare.medVault.constant.MedVaultConstants;
import com.healthcare.medVault.dto.DoctorProfileRequest;
import com.healthcare.medVault.dto.DoctorProfileResponse;
import com.healthcare.medVault.dto.PatientProfileDTO;
import com.healthcare.medVault.dto.PatientSummaryDTO;
import com.healthcare.medVault.entity.Doctor;
import com.healthcare.medVault.entity.Patient;
import com.healthcare.medVault.entity.User;
import com.healthcare.medVault.helper.VerificationStatus;
import com.healthcare.medVault.repository.DoctorRepository;
import com.healthcare.medVault.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorServiceImpl(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<DoctorProfileResponse> getPendingDoctors(){
        List<Doctor> doctors = doctorRepository.findByStatus(VerificationStatus.PENDING);
        return doctors.stream()
                .map(doctor -> new DoctorProfileResponse(
                        doctor.getId(),
                        doctor.getUser().getUsername(),
                        doctor.getFirstName(),
                        doctor.getLastName(),
                        doctor.getGender(),
                        doctor.getDateOfBirth(),
                        doctor.getContactNumber(),
                        doctor.getAddress(),
                        doctor.getSpecialization(),
                        doctor.getDepartment(),
                        doctor.getYearsOfExperience(),
                        doctor.getConsultationFees(),
                        doctor.getLanguagesSpoken(),
                        doctor.getMedicalDegreeCertificate(),
                        doctor.getMedicalCouncilRegistrationNumber(),
                        doctor.getGovernmentIdNumber(),
                        doctor.getGovernmentIdUrl(),
                        doctor.getClinicHospitalAffiliationProof(),
                        doctor.getUser().isProfileCompleted(),
                        doctor.getStatus(),
                        doctor.getLatitude(),
                        doctor.getLongitude()
                ))
                .toList();
    }

    @Override
    public List<DoctorProfileResponse> getApprovedDoctors(){
        List<Doctor> doctors = doctorRepository.findByStatus(VerificationStatus.APPROVED);
        return doctors.stream()
                .map(doctor -> new DoctorProfileResponse(
                        doctor.getId(),
                        doctor.getUser().getUsername(),
                        doctor.getFirstName(),
                        doctor.getLastName(),
                        doctor.getGender(),
                        doctor.getDateOfBirth(),
                        doctor.getContactNumber(),
                        doctor.getAddress(),
                        doctor.getSpecialization(),
                        doctor.getDepartment(),
                        doctor.getYearsOfExperience(),
                        doctor.getConsultationFees(),
                        doctor.getLanguagesSpoken(),
                        doctor.getMedicalDegreeCertificate(),
                        doctor.getMedicalCouncilRegistrationNumber(),
                        doctor.getGovernmentIdNumber(),
                        doctor.getGovernmentIdUrl(),
                        doctor.getClinicHospitalAffiliationProof(),
                        doctor.getUser().isProfileCompleted(),
                        doctor.getStatus(),
                        doctor.getLatitude(),
                        doctor.getLongitude()
                ))
                .toList();
    }

    @Override
    public DoctorProfileResponse verifyDoctorProfile(Long id, boolean isVerified) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        if (isVerified) {
            doctor.setStatus(VerificationStatus.APPROVED);
        } else {
            doctor.setStatus(VerificationStatus.REJECTED);
        }

        Doctor updatedDoctor = doctorRepository.save(doctor);
        return mapToResponse(updatedDoctor);
    }

    @Override
    public DoctorProfileResponse createDoctorProfile(DoctorProfileRequest request) {
        User user = userRepository.findByUsername(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        mapRequestToDoctor(request, doctor);
        user.setProfileCompleted(true);
        return mapToResponse(doctorRepository.save(doctor));
    }

    @Override
    public Doctor getDoctorProfileByUserId(String userId) {
        User user = userRepository.findByUsername(userId)
                .orElseThrow(() -> new RuntimeException(MedVaultConstants.USER_NOT_FOUND));

        return doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
    }

    @Override
    public Doctor updateDoctorProfile(Long id, DoctorProfileRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        mapRequestToDoctor(request, doctor);
        return doctorRepository.save(doctor);
    }

    private DoctorProfileResponse mapToResponse(Doctor doctor) {
        DoctorProfileResponse response = new DoctorProfileResponse();
        response.setId(doctor.getId());
        response.setUserId(doctor.getUser().getUsername());
        response.setFirstName(doctor.getFirstName());
        response.setLastName(doctor.getLastName());
        response.setGender(doctor.getGender());
        response.setDateOfBirth(doctor.getDateOfBirth());
        response.setContactNumber(doctor.getContactNumber());
        response.setAddress(doctor.getAddress());
        response.setSpecialization(doctor.getSpecialization());
        response.setDepartment(doctor.getDepartment());
        response.setYearsOfExperience(doctor.getYearsOfExperience());
        response.setConsultationFees(doctor.getConsultationFees());
        response.setLanguagesSpoken(doctor.getLanguagesSpoken());
        response.setMedicalDegreeUrl(doctor.getMedicalDegreeCertificate());
        response.setLicenseNumber(doctor.getMedicalCouncilRegistrationNumber());
        response.setGovernmentIdNumber(doctor.getGovernmentIdNumber());
        response.setGovernmentIdUrl(doctor.getGovernmentIdUrl());
        response.setAffiliationProofUrl(doctor.getClinicHospitalAffiliationProof());
        response.setLatitude(doctor.getLatitude());
        response.setLongitude(doctor.getLongitude());
        response.setProfileComplete(doctor.getUser().isProfileCompleted());
        response.setStatus(doctor.getStatus());

        return response;
    }

    private void mapRequestToDoctor(DoctorProfileRequest request, Doctor doctor) {
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setGender(request.getGender());
        doctor.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        doctor.setContactNumber(request.getContactNumber());
        doctor.setAddress(request.getAddress());
        doctor.setSpecialization(String.join(",", request.getSpecialization()));
        doctor.setDepartment(request.getDepartment());
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        doctor.setConsultationFees(request.getConsultationFees());
        doctor.setLanguagesSpoken(String.join(",", request.getLanguagesSpoken()));
        doctor.setMedicalCouncilRegistrationNumber(request.getLicenseNumber());
        doctor.setGovernmentIdNumber(request.getGovernmentIdNumber());

        doctor.setMedicalDegreeCertificate(request.getMedicalDegreeUrl());
        doctor.setGovernmentIdUrl(request.getGovernmentIdUrl());
        doctor.setClinicHospitalAffiliationProof(request.getAffiliationProofUrl());
        doctor.setLatitude(request.getLatitude());
        doctor.setLongitude(request.getLongitude());
    }
}