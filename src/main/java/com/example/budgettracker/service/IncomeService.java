package com.example.budgettracker.service;

import com.example.budgettracker.dto.IncomeRequest;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Income;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IncomeService {

  Income saveIncomeForUser(IncomeRequest incomeRequest, AppUser user);

  Income updateIncomeForUser(Long incomeId, IncomeRequest incomeRequest, AppUser user);

  void deleteIncomeForUser(Long incomeId, AppUser user);

  /** Returns all income entries that belong to the given user. */
  List<Income> getIncomeForUser(AppUser user);

  /** Returns paginated income entries that belong to the given user. */
  Page<Income> getIncomeForUser(AppUser user, Pageable pageable);

  /** Get income entries for a specific date range. */
  List<Income> getIncomeForUserAndDateRange(AppUser user, LocalDate startDate, LocalDate endDate);

  /** Calculate total income for a specific period. */
  BigDecimal getTotalIncomeForPeriod(AppUser user, LocalDate startDate, LocalDate endDate);
}
