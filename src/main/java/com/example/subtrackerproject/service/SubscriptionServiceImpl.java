package com.example.subtrackerproject.service;

import com.example.subtrackerproject.dto.SubscriptionRequest;
import com.example.subtrackerproject.exception.SubscriptionNotFoundException;
import com.example.subtrackerproject.exception.UnauthorizedAccessException;
import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.model.Subscription;
import com.example.subtrackerproject.repository.CategoryRepository;
import com.example.subtrackerproject.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public Subscription saveSubscriptionForUser(SubscriptionRequest request, AppUser user) {
        Subscription subscription = new Subscription();
        subscription.setName(request.getName());
        subscription.setPrice(request.getPrice());
        subscription.setBillingPeriod(request.getBillingPeriod());
        subscription.setNextBillingDate(request.getNextBillingDate());
        subscription.setActive(true);
        subscription.setAppUser(user);
        // maintain bidirectional relationship
        user.getSubscriptions().add(subscription);

        if (StringUtils.hasText(request.getCategoryName())) {
            Category category = findOrCreateCategory(request.getCategoryName());
            subscription.setCategory(category);
        }

        return subscriptionRepository.save(subscription);
    }

    @Override
    @Transactional
    public Subscription updateSubscriptionForUser(Long subscriptionId, SubscriptionRequest request, AppUser user) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException(subscriptionId));

        if (!subscription.getAppUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("subscription " + subscriptionId, user.getId());
        }

        subscription.setName(request.getName());
        subscription.setPrice(request.getPrice());
        subscription.setBillingPeriod(request.getBillingPeriod());
        subscription.setNextBillingDate(request.getNextBillingDate());

        if (StringUtils.hasText(request.getCategoryName())) {
            Category category = findOrCreateCategory(request.getCategoryName());
            subscription.setCategory(category);
        } else {
            subscription.setCategory(null);
        }

        return subscriptionRepository.save(subscription);
    }

    @Override
    @Transactional
    public void deleteSubscriptionForUser(Long subscriptionId, AppUser user) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException(subscriptionId));

        if (!subscription.getAppUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("subscription " + subscriptionId, user.getId());
        }

        subscriptionRepository.delete(subscription);

        // maintain bidirectional relationship
        user.getSubscriptions().remove(subscription);
    }

    @Cacheable(value = "categories", key = "#categoryName.toLowerCase()")
    private Category findOrCreateCategory(String categoryName) {
        return categoryRepository.findByNameIgnoreCase(categoryName)
                .orElseGet(() -> categoryRepository.save(new Category(categoryName)));
    }
}
