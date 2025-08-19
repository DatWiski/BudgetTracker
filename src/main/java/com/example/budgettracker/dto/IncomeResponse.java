package com.example.budgettracker.dto;

import com.example.budgettracker.model.Income;
import com.example.budgettracker.model.Period;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class IncomeResponse {

    private Long id;
    private String name;
    private BigDecimal amount;
    private LocalDate incomeDate;
    private Period period;
    private String description;
    private Long categoryId;
    private String categoryName;
    private LocalDate nextPaymentDate;

    public static IncomeResponse fromEntity(Income income, LocalDate nextPaymentDate) {
        IncomeResponse dto = new IncomeResponse();
        dto.setId(income.getId());
        dto.setName(income.getName());
        dto.setAmount(income.getAmount());
        dto.setIncomeDate(income.getIncomeDate());
        dto.setPeriod(income.getPeriod());
        dto.setDescription(income.getDescription());
        dto.setNextPaymentDate(nextPaymentDate);
        if (income.getCategory() != null) {
            dto.setCategoryId(income.getCategory().getId());
            dto.setCategoryName(income.getCategory().getName());
        }
        return dto;
    }
    
    @Deprecated
    public static IncomeResponse fromEntity(Income income) {
        return fromEntity(income, income.getIncomeDate());
    }
}