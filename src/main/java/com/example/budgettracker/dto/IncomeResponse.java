package com.example.budgettracker.dto;

import com.example.budgettracker.model.Income;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class IncomeResponse {

    private Long id;
    private String name;
    private BigDecimal amount;
    private LocalDate incomeDate;
    private String description;
    private Long categoryId;
    private String categoryName;

    public static IncomeResponse fromEntity(Income income) {
        IncomeResponse dto = new IncomeResponse();
        dto.setId(income.getId());
        dto.setName(income.getName());
        dto.setAmount(income.getAmount());
        dto.setIncomeDate(income.getIncomeDate());
        dto.setDescription(income.getDescription());
        if (income.getCategory() != null) {
            dto.setCategoryId(income.getCategory().getId());
            dto.setCategoryName(income.getCategory().getName());
        }
        return dto;
    }
}