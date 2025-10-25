package com.healthcare.medVault.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "slots")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private LocalDate date; // The day of the slot (e.g., 2025-09-15)

    @Column(nullable = false)
    private LocalTime timeFrom; // The start time (e.g., 10:00)

    @Column(nullable = false)
    private LocalTime timeTo; // The end time (e.g., 10:30)

    @Column(nullable = false)
    private Boolean isAvailable = true; // False once booked

    @Column(nullable = false)
    private Integer duration;

    // Optional: You can add auto-timestamp fields like in your User entity
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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