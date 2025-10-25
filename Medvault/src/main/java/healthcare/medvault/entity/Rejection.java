package com.healthcare.medVault.entity;

import com.healthcare.medVault.helper.EmergencyStatus;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
public class Rejection {

    @EmbeddedId
    private RejectionId rejectionId;
    private String reason;
    private EmergencyStatus status=EmergencyStatus.REJECTED;
}
