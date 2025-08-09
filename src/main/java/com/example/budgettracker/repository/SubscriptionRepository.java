package com.example.budgettracker.repository;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    @EntityGraph(attributePaths = {"category"})
    List<Subscription> findByCategoryAndAppUser(Category category, AppUser appUser);

    @EntityGraph(attributePaths = {"category"})
    List<Subscription> findByAppUserAndActive(AppUser appUser, boolean active);

    @EntityGraph(attributePaths = {"category"})
    Page<Subscription> findByAppUserAndActive(AppUser appUser, boolean active, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Subscription> findByAppUser(AppUser appUser);

    @EntityGraph(attributePaths = {"category"})
    Page<Subscription> findByAppUser(AppUser appUser, Pageable pageable);
}
