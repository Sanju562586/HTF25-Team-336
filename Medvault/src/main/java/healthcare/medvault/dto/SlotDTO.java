package com.healthcare.medVault.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SlotDTO {
    private Long id;
    private Long doctorId;
    private LocalDate date;
    private LocalTime timeFrom;
    private LocalTime timeTo;
    private Boolean isAvailable;
    private Integer duration;
}