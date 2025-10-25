package com.healthcare.medVault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginationMeta {
    private int currentPage;
    private int totalPages;
    private long totalItems;
    private int itemsPerPage;
}