package com.example.subtrackerproject.repository;

import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    List<Subscription> findByCategoryAndAppUser(Category category, AppUser appUser);
    
    List<Subscription> findByAppUserAndIsActive(AppUser appUser, boolean isActive);
}
