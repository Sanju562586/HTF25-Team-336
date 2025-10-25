// PatientHealthRecord.java (Updated)
package com.healthcare.medVault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "patient_health_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientHealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private String patientId;

    @Column(name = "basic_demographics", columnDefinition = "TEXT")
    private String basicDemographics;

    @Column(name = "identification_details", columnDefinition = "TEXT")
    private String identificationDetails;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(name = "lifestyle_info", columnDefinition = "TEXT")
    private String lifestyleInfo;

    @Column(name = "current_health", columnDefinition = "TEXT")
    private String currentHealth;

    @Column(name = "consent_preferences", columnDefinition = "TEXT")
    private String consentPreferences;

    @Column(name = "documents", columnDefinition = "TEXT") // ADD THIS FIELD
    private String documents;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}