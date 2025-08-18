package com.example.budgettracker.service;

import com.example.budgettracker.dto.IncomeRequest;
import com.example.budgettracker.exception.IncomeNotFoundException;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.Income;
import com.example.budgettracker.repository.IncomeRepository;
import com.example.budgettracker.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private static final String DEFAULT_INCOME_CATEGORY = "Income";
    
    private final IncomeRepository incomeRepository;
    private final CategoryService categoryService;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public Income saveIncomeForUser(IncomeRequest request, AppUser user) {
        Income income = new Income();
        income.setName(request.getName());
        income.setAmount(request.getAmount());
        income.setIncomeDate(request.getIncomeDate());
        income.setDescription(request.getDescription());
        income.setAppUser(user);

        // If no category is specified, use the default income category
        Category category;
        if (request.getCategoryId() != null) {
            category = categoryService.findByIdAndUser(request.getCategoryId(), user);
        } else {
            category = categoryService.findOrCreateCategory(DEFAULT_INCOME_CATEGORY, user);
        }
        income.setCategory(category);

        return incomeRepository.save(income);
    }

    @Override
    @Transactional
    public Income updateIncomeForUser(Long incomeId, IncomeRequest request, AppUser user) {
        Income income = incomeRepository.findByIdAndAppUser(incomeId, user)
                .orElseThrow(() -> new IncomeNotFoundException("Income not found with ID: " + incomeId));

        securityUtils.validateResourceOwnership(income.getAppUser(), user, "Income", incomeId);

        income.setName(request.getName());
        income.setAmount(request.getAmount());
        income.setIncomeDate(request.getIncomeDate());
        income.setDescription(request.getDescription());

        // Update category if provided
        if (request.getCategoryId() != null) {
            Category category = categoryService.findByIdAndUser(request.getCategoryId(), user);
            income.setCategory(category);
        } else {
            Category category = categoryService.findOrCreateCategory(DEFAULT_INCOME_CATEGORY, user);
            income.setCategory(category);
        }

        return incomeRepository.save(income);
    }

    @Override
    @Transactional
    public void deleteIncomeForUser(Long incomeId, AppUser user) {
        Income income = incomeRepository.findByIdAndAppUser(incomeId, user)
                .orElseThrow(() -> new IncomeNotFoundException("Income not found with ID: " + incomeId));

        securityUtils.validateResourceOwnership(income.getAppUser(), user, "Income", incomeId);

        incomeRepository.delete(income);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Income> getIncomeForUser(AppUser user) {
        return incomeRepository.findByAppUserOrderByIncomeDateDesc(user, Pageable.unpaged()).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Income> getIncomeForUser(AppUser user, Pageable pageable) {
        return incomeRepository.findByAppUserOrderByIncomeDateDesc(user, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Income> getIncomeForUserAndDateRange(AppUser user, LocalDate startDate, LocalDate endDate) {
        return incomeRepository.findByAppUserAndIncomeDateBetweenOrderByIncomeDateDesc(user, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalIncomeForPeriod(AppUser user, LocalDate startDate, LocalDate endDate) {
        return incomeRepository.getTotalIncomeForPeriod(user, startDate, endDate);
    }
}