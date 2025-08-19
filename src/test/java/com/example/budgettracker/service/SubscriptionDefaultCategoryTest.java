package com.example.budgettracker.service;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Period;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@SpringBootTest
class SubscriptionDefaultCategoryTest {

    @Autowired
    private SubscriptionService subscriptionService;
    @Autowired
    private com.example.budgettracker.repository.AppUserRepository appUserRepository;

    @Test
    @Transactional
    void subscriptionWithoutCategoryGetsSystemCategory() {
        AppUser user = new AppUser("sub", "Test User", "test@example.com", null);
        appUserRepository.save(user);

        SubscriptionRequest req = new SubscriptionRequest();
        req.setName("Netflix");
        req.setPrice(BigDecimal.valueOf(9.99));
        req.setPeriod(Period.MONTHLY);
        req.setNextBillingDate(LocalDate.now().plusDays(1));
        // no categoryName

        var saved = subscriptionService.saveSubscriptionForUser(req, user);
        Assertions.assertEquals("Subscriptions", saved.getCategory().getName());
    }
} 