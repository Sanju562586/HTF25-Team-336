package com.healthcare.medVault.config;

import com.healthcare.medVault.service.DocumentPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PermissionCleanupScheduler {

    private final DocumentPermissionService permissionService;

    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredPermissions() {
        permissionService.cleanupExpiredPermissions();
    }
}