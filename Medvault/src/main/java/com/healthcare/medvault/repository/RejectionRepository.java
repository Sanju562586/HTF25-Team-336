package com.healthcare.medVault.repository;

import com.healthcare.medVault.entity.Rejection;
import com.healthcare.medVault.entity.RejectionId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RejectionRepository extends JpaRepository<Rejection, RejectionId> {
    //nothing
}
