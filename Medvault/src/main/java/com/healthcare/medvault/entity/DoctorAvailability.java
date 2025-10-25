package com.healthcare.medVault.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "doctor_availability")
@Data
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", unique = true, nullable = false)
    private Doctor doctor;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = false;

    @Column(name = "current_location")
    private String currentLocation;

    @Column(name = "last_updated")
    private java.time.LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = java.time.LocalDateTime.now();
    }
}