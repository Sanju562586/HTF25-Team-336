package com.healthcare.medVault.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Embeddable
@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class RejectionId {
    private Long emergencyRequestId;
    private Long doctorId;
}
