package com.example.budgettracker.repository;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Bill;
import com.example.budgettracker.model.Category;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Long> {

  @EntityGraph(attributePaths = {"category"})
  List<Bill> findByCategoryAndAppUser(Category category, AppUser appUser);

  @EntityGraph(attributePaths = {"category"})
  List<Bill> findByAppUserAndActive(AppUser appUser, boolean active);

  @EntityGraph(attributePaths = {"category"})
  Page<Bill> findByAppUserAndActive(AppUser appUser, boolean active, Pageable pageable);

  @EntityGraph(attributePaths = {"category"})
  List<Bill> findByAppUser(AppUser appUser);

  @EntityGraph(attributePaths = {"category"})
  Page<Bill> findByAppUser(AppUser appUser, Pageable pageable);
}
