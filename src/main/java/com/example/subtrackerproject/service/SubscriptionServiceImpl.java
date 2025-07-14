package com.example.subtrackerproject.service;

import com.example.subtrackerproject.dto.SubscriptionRequest;
import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.model.Subscription;
import com.example.subtrackerproject.repository.CategoryRepository;
import com.example.subtrackerproject.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
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

        if (StringUtils.hasText(request.getCategoryName())) {
            Category category = categoryRepository.findByNameIgnoreCase(request.getCategoryName())
                    .orElseGet(() -> {
                        Category newCategory = new Category();
                        newCategory.setName(request.getCategoryName());
                        return categoryRepository.save(newCategory);
                    });
            subscription.setCategory(category);
        }

        return subscriptionRepository.save(subscription);
    }
}
