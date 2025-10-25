package com.healthcare.medVault.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    private static final String UPLOAD_DIR = "/uploads/";

    @Override
    public Map<String, String> uploadDocument(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty!");
        }

        try {
            String uploadDir = System.getProperty("user.dir") + UPLOAD_DIR;

            // Ensure directory exists
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID() + fileExtension;

            // Save file
            String filePath = uploadDir + uniqueFilename;
            file.transferTo(new File(filePath));

            String url = UPLOAD_DIR + uniqueFilename;
            return Map.of("url", url);

        } catch (IOException e) {
            throw new RuntimeException("Error uploading file: " + e.getMessage(), e);
        }
    }

    @Override
    public Resource getDocument(String filename) {
        try {
            String uploadDir = System.getProperty("user.dir") + UPLOAD_DIR;
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File URL is malformed", e);
        }
    }

    @Override
    public MediaType getMediaTypeForFileName(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

        switch (extension) {
            case "pdf":
                return MediaType.APPLICATION_PDF;
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG;
            case "png":
                return MediaType.IMAGE_PNG;
            case "gif":
                return MediaType.IMAGE_GIF;
            case "txt":
                return MediaType.TEXT_PLAIN;
            case "html":
                return MediaType.TEXT_HTML;
            case "json":
                return MediaType.APPLICATION_JSON;
            case "xml":
                return MediaType.APPLICATION_XML;
            case "zip":
                return MediaType.parseMediaType("application/zip");
            case "doc":
            case "docx":
                return MediaType.parseMediaType("application/msword");
            case "xls":
            case "xlsx":
                return MediaType.parseMediaType("application/vnd.ms-excel");
            case "ppt":
            case "pptx":
                return MediaType.parseMediaType("application/vnd.ms-powerpoint");
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}