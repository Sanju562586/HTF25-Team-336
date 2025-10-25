package com.healthcare.medVault.entity;

import com.healthcare.medVault.dto.DoctorProfileResponse;
import com.healthcare.medVault.helper.Gender;
import com.healthcare.medVault.helper.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "address")
    private String address;

    // Doctor Professional Details
    @Column(name = "specialization")
    private String specialization;

    @Column(name = "department")
    private String department;

    @Column(name = "years_of_experience", nullable = false)
    private Integer yearsOfExperience;

    @Column(name = "consultation_fees")
    private Double consultationFees;

    @Column(name = "languages_spoken")
    private String languagesSpoken;

    // Doctor Documents
    @Column(name = "medical_degree_certificate")
    private String medicalDegreeCertificate = ""; // File path or URL

    @Column(name = "medical_council_registration_number", nullable = false)
    private String medicalCouncilRegistrationNumber;

    @Column(name = "government_id_number")
    private String governmentIdNumber;

    @Column(name = "government_id_url")
    private String governmentIdUrl = "";

    @Column(name = "clinic_hospital_affiliation_proof")
    private String clinicHospitalAffiliationProof = "";

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private VerificationStatus status = VerificationStatus.PENDING;
    
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;
}