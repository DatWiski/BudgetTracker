package com.example.budgettracker.repository;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Income;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

  Page<Income> findByAppUserOrderByIncomeDateDesc(AppUser appUser, Pageable pageable);

  List<Income> findByAppUser(AppUser appUser);

  List<Income> findByAppUserAndIncomeDateBetweenOrderByIncomeDateDesc(
      AppUser appUser, LocalDate startDate, LocalDate endDate);

  Optional<Income> findByIdAndAppUser(Long id, AppUser appUser);

  @Query(
      "SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.appUser = :user AND i.incomeDate BETWEEN :startDate AND :endDate")
  BigDecimal getTotalIncomeForPeriod(
      @Param("user") AppUser user,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  @Query("SELECT COUNT(i) FROM Income i WHERE i.appUser = :user AND i.incomeDate >= :startDate")
  long countByUserAndDateAfter(
      @Param("user") AppUser user, @Param("startDate") LocalDate startDate);
}
