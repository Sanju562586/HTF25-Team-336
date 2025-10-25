package com.healthcare.medVault.service;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface FileService {
    Map<String, String> uploadDocument(MultipartFile file);
    Resource getDocument(String filename);
    MediaType getMediaTypeForFileName(String fileName);
}