package com.example.budgettracker.service;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.exception.SubscriptionNotFoundException;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.Subscription;
import com.example.budgettracker.repository.SubscriptionRepository;
import com.example.budgettracker.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final String DEFAULT_SUBSCRIPTION_CATEGORY = "Subscriptions";
    
    private final SubscriptionRepository subscriptionRepository;
    private final CategoryService categoryService;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public Subscription saveSubscriptionForUser(SubscriptionRequest request, AppUser user) {
        Subscription subscription = new Subscription();
        subscription.setName(request.getName());
        subscription.setPrice(request.getPrice());
        subscription.setBillingPeriod(request.getBillingPeriod());
        subscription.setNextBillingDate(request.getNextBillingDate());
        subscription.setActive(request.isActive());
        subscription.setAppUser(user);
        // maintain bidirectional relationship
        user.getSubscriptions().add(subscription);

        // If no category is specified, use the default subscription category
        Category category;
        if (request.getCategoryId() != null) {
            category = categoryService.findByIdAndUser(request.getCategoryId(), user);
        } else {
            category = categoryService.findOrCreateCategory(DEFAULT_SUBSCRIPTION_CATEGORY, user);
        }
        subscription.setCategory(category);

        return subscriptionRepository.save(subscription);
    }

    @Override
    @Transactional
    public Subscription updateSubscriptionForUser(Long subscriptionId, SubscriptionRequest request, AppUser user) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException(subscriptionId));

        securityUtils.validateResourceOwnership(subscription.getAppUser(), user, "subscription", subscriptionId);

        subscription.setName(request.getName());
        subscription.setPrice(request.getPrice());
        subscription.setBillingPeriod(request.getBillingPeriod());
        subscription.setNextBillingDate(request.getNextBillingDate());
        subscription.setActive(request.isActive());

        if (request.getCategoryId() != null) {
            Category category = categoryService.findByIdAndUser(request.getCategoryId(), user);
            subscription.setCategory(category);
        } else {
            // Align with create behavior: use default "Subscriptions" category when none specified
            Category defaultCategory = categoryService.findOrCreateCategory(DEFAULT_SUBSCRIPTION_CATEGORY, user);
            subscription.setCategory(defaultCategory);
        }

        return subscriptionRepository.save(subscription);
    }

    @Override
    @Transactional
    public void deleteSubscriptionForUser(Long subscriptionId, AppUser user) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException(subscriptionId));

        securityUtils.validateResourceOwnership(subscription.getAppUser(), user, "subscription", subscriptionId);

        subscriptionRepository.delete(subscription);

        // maintain bidirectional relationship
        user.getSubscriptions().remove(subscription);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<Subscription> getSubscriptionsForUser(AppUser user) {
        // Fetch all subscriptions (active and inactive) that belong to the given user
        return subscriptionRepository.findByAppUser(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Subscription> getSubscriptionsForUser(AppUser user, Pageable pageable) {
        return subscriptionRepository.findByAppUser(user, pageable);
    }
}
