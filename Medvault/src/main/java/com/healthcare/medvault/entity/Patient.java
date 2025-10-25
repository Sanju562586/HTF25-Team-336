package com.healthcare.medVault.entity;

import com.healthcare.medVault.helper.Gender;
import com.healthcare.medVault.helper.VerificationStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Data
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String firstName;

    private String lastName;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String contactNumber;

    private String address;

    private String emergencyContact;

    private String governmentIdNumber;
    private String governmentIdUrl;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

}
