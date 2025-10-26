package com.healthcare.medVault.controller;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.Slot;
import com.healthcare.medVault.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

    @Autowired
    private SlotService slotService;

    @PostMapping
    public ResponseEntity<SlotDTO> createSlot(@RequestBody SlotRequest request) {
        try {
            SlotDTO slotDTO = slotService.createSlot(request);
            return ResponseEntity.ok(slotDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/batch")
    public ResponseEntity<List<SlotDTO>> createMultipleSlots(@RequestBody List<SlotRequest> requests) {
        try {
            List<Slot> slots = slotService.createMultipleSlots(requests);
            List<SlotDTO> slotDTOs = slots.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(slotDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<List<SlotDTO>> generateAndCreateSlots(@RequestBody BatchSlotRequest request) {
        try {
            // Generate slots based on time range and duration
            List<SlotRequest> slotRequests = slotService.generateTimeSlots(request);

            // Create all generated slots
            List<Slot> slots = slotService.createMultipleSlots(slotRequests);

            List<SlotDTO> slotDTOs = slots.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(slotDTOs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<SlotDTO>> getDoctorSlots(@PathVariable Long doctorId) {
        List<Slot> slots = slotService.getDoctorSlots(doctorId);
        List<SlotDTO> slotDTOs = slots.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(slotDTOs);
    }

    @GetMapping("/available/{doctorId}")
    public ResponseEntity<List<SlotDTO>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Slot> slots = slotService.getAvailableSlots(doctorId, date);
        List<SlotDTO> slotDTOs = slots.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(slotDTOs);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/check-conflict")
    public ResponseEntity<SlotConflictResponse> checkSlotConflict(@RequestBody SlotConflictCheckRequest request) {
        SlotConflictResponse response = slotService.checkSlotConflict(request);
        return ResponseEntity.ok(response);
    }

    // Helper method to convert Entity to DTO
    private SlotDTO convertToDTO(Slot slot) {
        SlotDTO dto = new SlotDTO();
        dto.setId(slot.getId());
        dto.setDoctorId(slot.getDoctor().getId());
        dto.setDate(slot.getDate());
        dto.setTimeFrom(slot.getTimeFrom());
        dto.setTimeTo(slot.getTimeTo());
        dto.setDuration(slot.getDuration());
        dto.setIsAvailable(slot.getIsAvailable());
        return dto;
    }
}