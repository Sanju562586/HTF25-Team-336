package com.healthcare.medVault.service;

import com.healthcare.medVault.dto.*;
import com.healthcare.medVault.entity.Slot;
import java.time.LocalDate;
import java.util.List;

public interface SlotService {

    SlotDTO createSlot(SlotRequest request);
    List<Slot> createMultipleSlots(List<SlotRequest> requests);
    List<Slot> getDoctorSlots(Long doctorId);
    List<Slot> getAvailableSlots(Long doctorId, LocalDate date);
    void deleteSlot(Long id);
    SlotConflictResponse checkSlotConflict(SlotConflictCheckRequest request);
    List<SlotRequest> generateTimeSlots(BatchSlotRequest request);
}