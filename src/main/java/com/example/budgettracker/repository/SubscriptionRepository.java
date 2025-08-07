package com.example.budgettracker.repository;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    List<Subscription> findByCategoryAndAppUser(Category category, AppUser appUser);
    
    List<Subscription> findByAppUserAndActive(AppUser appUser, boolean active);
    
    Page<Subscription> findByAppUserAndActive(AppUser appUser, boolean active, Pageable pageable);
    
    List<Subscription> findByAppUser(AppUser appUser);
    
    Page<Subscription> findByAppUser(AppUser appUser, Pageable pageable);
}
