package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.Doctor;
import com.healthcare.medVault.entity.Slot;
import com.healthcare.medVault.repository.DoctorRepository;
import com.healthcare.medVault.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SlotServiceImpl implements SlotService {

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    @Transactional
    public SlotDTO createSlot(SlotRequest request) {
        // Check for conflicts
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + request.getDoctorId()));

        List<Slot> conflictingSlots = slotRepository.findConflictingSlots(
                request.getDoctorId(),
                request.getDate(),
                request.getTimeFrom(),
                request.getTimeTo()
        );

        if (!conflictingSlots.isEmpty()) {
            throw new IllegalArgumentException("Slot conflicts with existing slots");
        }

        Slot slot = new Slot();
        slot.setDoctor(doctor);
        slot.setDate(request.getDate());
        slot.setTimeFrom(request.getTimeFrom());
        slot.setTimeTo(request.getTimeTo());
        slot.setDuration(request.getDuration());
        slot.setIsAvailable(true);

        Slot savedSlot = slotRepository.save(slot);
        return convertToDTO(savedSlot);
    }

    @Override
    @Transactional
    public List<Slot> createMultipleSlots(List<SlotRequest> requests) {
        List<Slot> slotsToSave = new ArrayList<>();

        for (SlotRequest request : requests) {
            // Check for conflicts
            List<Slot> conflictingSlots = slotRepository.findConflictingSlots(
                    request.getDoctorId(),
                    request.getDate(),
                    request.getTimeFrom(),
                    request.getTimeTo()
            );

            if (!conflictingSlots.isEmpty()) {
                throw new IllegalArgumentException(
                        "Slot conflicts with existing slots: " +
                                request.getDate() + " " + request.getTimeFrom() + "-" + request.getTimeTo()
                );
            }

            Doctor doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + request.getDoctorId()));

            Slot slot = new Slot();
            slot.setDoctor(doctor);
            slot.setDate(request.getDate());
            slot.setTimeFrom(request.getTimeFrom());
            slot.setTimeTo(request.getTimeTo());
            slot.setDuration(request.getDuration());
            slot.setIsAvailable(true);

            slotsToSave.add(slot);
        }

        return slotRepository.saveAll(slotsToSave);
    }

    @Override
    public List<Slot> getDoctorSlots(Long doctorId) {
        return slotRepository.findByDoctorId(doctorId);
    }

    @Override
    public List<Slot> getAvailableSlots(Long doctorId, LocalDate date) {
        return slotRepository.findByDoctorIdAndDateAndIsAvailableTrue(doctorId, date);
    }

    @Override
    @Transactional
    public void deleteSlot(Long id) {
        slotRepository.deleteById(id);
    }

    @Override
    public SlotConflictResponse checkSlotConflict(SlotConflictCheckRequest request) {
        List<Slot> conflictingSlots = slotRepository.findConflictingSlots(
                request.getDoctorId(),
                request.getDate(),
                request.getTimeFrom(),
                request.getTimeTo()
        );

        SlotConflictResponse response = new SlotConflictResponse();
        response.setHasConflict(!conflictingSlots.isEmpty());
        return response;
    }

    @Override
    public List<SlotRequest> generateTimeSlots(BatchSlotRequest request) {
        List<SlotRequest> slots = new ArrayList<>();

        if (request.getDuration() <= 0) {
            throw new IllegalArgumentException("Duration must be a positive number");
        }

        if (request.getTimeFrom().isAfter(request.getTimeTo()) || request.getTimeFrom().equals(request.getTimeTo())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        LocalTime currentTime = request.getTimeFrom();

        while (currentTime.isBefore(request.getTimeTo())) {
            LocalTime slotEnd = currentTime.plusMinutes(request.getDuration());

            // Don't create a slot that would extend beyond the requested end time
            if (slotEnd.isAfter(request.getTimeTo())) {
                break;
            }

            SlotRequest slotRequest = new SlotRequest();
            slotRequest.setDoctorId(request.getDoctorId());
            slotRequest.setDate(request.getDate());
            slotRequest.setTimeFrom(currentTime);
            slotRequest.setTimeTo(slotEnd);
            slotRequest.setDuration(request.getDuration());

            slots.add(slotRequest);
            currentTime = slotEnd;
        }

        return slots;
    }

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