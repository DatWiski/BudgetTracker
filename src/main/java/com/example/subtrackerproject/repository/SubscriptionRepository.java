package com.example.subtrackerproject.repository;

import com.example.subtrackerproject.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
}
