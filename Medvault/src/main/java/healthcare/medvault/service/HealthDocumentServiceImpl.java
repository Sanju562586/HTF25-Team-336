package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.HealthDocumentDTO;
import com.healthcare.medVault.entity.HealthDocument;
import com.healthcare.medVault.helper.DocumentType;
import com.healthcare.medVault.repository.HealthDocumentRepository;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HealthDocumentServiceImpl implements HealthDocumentService {

    private final HealthDocumentRepository healthDocumentRepository;
    private final ModelMapper modelMapper;

    @Value("${file.upload-dir:uploads/documents}")
    private String uploadDir;

    private Path fileStorageLocation;

    public HealthDocumentServiceImpl(HealthDocumentRepository healthDocumentRepository,
                                     ModelMapper modelMapper) {
        this.healthDocumentRepository = healthDocumentRepository;
        this.modelMapper = modelMapper;
    }

    @PostConstruct
    public void init() {
        try {
            this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public HealthDocumentDTO uploadDocument(String patientId, MultipartFile file,
                                            DocumentType documentType, String description) {
        try {
            // Generate unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Copy file to the target location
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Create document entity
            HealthDocument document = new HealthDocument();
            document.setPatientId(patientId);
            document.setName(originalFileName != null ? originalFileName : "Untitled");
            document.setType(documentType);
            document.setFilePath(targetLocation.toString());
            document.setSize(file.getSize());
            document.setDescription(description);

            // Generate URL for the document
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/health-documents/download/")
                    .path(fileName)
                    .toUriString();
            document.setUrl(fileDownloadUri);

            // Save to database
            HealthDocument savedDocument = healthDocumentRepository.save(document);

            return convertToDTO(savedDocument);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
        }
    }

    @Override
    public List<HealthDocumentDTO> getDocumentsByPatientId(String patientId) {
        List<HealthDocument> documents = healthDocumentRepository.findByPatientId(patientId);
        return documents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HealthDocumentDTO getDocumentById(Long id, String patientId) {
        HealthDocument document = healthDocumentRepository.findByIdAndPatientId(id, patientId)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + id));
        return convertToDTO(document);
    }

    @Override
    public void deleteDocument(Long id) {
        HealthDocument document = healthDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + id));

        try {
            // Delete file from filesystem
            Files.deleteIfExists(Paths.get(document.getFilePath()));

            // Delete from database
            healthDocumentRepository.deleteById(id);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file. Please try again!", ex);
        }
    }

    @Override
    public byte[] downloadDocument(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return Files.readAllBytes(filePath);
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        } catch (IOException ex) {
            throw new RuntimeException("Error reading file " + fileName, ex);
        }
    }

    private HealthDocumentDTO convertToDTO(HealthDocument document) {
        return modelMapper.map(document, HealthDocumentDTO.class);
    }
}