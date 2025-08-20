package com.example.budgettracker.dto;

import com.example.budgettracker.model.Bill;
import com.example.budgettracker.model.Period;
import com.example.budgettracker.service.PeriodCalculationService;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BillResponse {

    private Long id;
    private String name;
    private BigDecimal amount;
    private Period period;
    private LocalDate dueDate;
    private LocalDate actualDueDate;
    private boolean active;
    private Long categoryId;
    private String categoryName;

    public static BillResponse fromEntity(Bill bill, PeriodCalculationService periodCalculationService) {
        BillResponse dto = new BillResponse();
        dto.setId(bill.getId());
        dto.setName(bill.getName());
        dto.setAmount(bill.getAmount());
        dto.setPeriod(bill.getPeriod());
        dto.setDueDate(bill.getDueDate());
        
        // Calculate the actual next due date using period calculations
        dto.setActualDueDate(periodCalculationService.getNextOccurrence(
            bill.getDueDate(), bill.getPeriod()
        ));
        
        dto.setActive(bill.isActive());
        if (bill.getCategory() != null) {
            dto.setCategoryId(bill.getCategory().getId());
            dto.setCategoryName(bill.getCategory().getName());
        }
        return dto;
    }

    // Keep the old method for backward compatibility, but it won't have calculated due dates
    @Deprecated
    public static BillResponse fromEntity(Bill bill) {
        BillResponse dto = new BillResponse();
        dto.setId(bill.getId());
        dto.setName(bill.getName());
        dto.setAmount(bill.getAmount());
        dto.setPeriod(bill.getPeriod());
        dto.setDueDate(bill.getDueDate());
        dto.setActualDueDate(bill.getDueDate()); // Fallback to original date
        dto.setActive(bill.isActive());
        if (bill.getCategory() != null) {
            dto.setCategoryId(bill.getCategory().getId());
            dto.setCategoryName(bill.getCategory().getName());
        }
        return dto;
    }
}