package com.healthcare.medVault.dto;

import com.healthcare.medVault.entity.DocumentPermissionRequest;
import lombok.Data;

@Data
public class DocumentPermissionResponseDTO {
    private String permissionRequestId;
    private String response;
    private String responseMessage;
}