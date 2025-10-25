package com.healthcare.medVault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyAppointmentsDTO {
    private Long month;
    private Long appointmentCount;
}
