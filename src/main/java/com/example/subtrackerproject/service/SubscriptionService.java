package com.example.subtrackerproject.service;

import com.example.subtrackerproject.dto.SubscriptionRequest;
import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Subscription;

public interface SubscriptionService {

    Subscription saveSubscriptionForUser(SubscriptionRequest subscriptionRequest, AppUser user);

    Subscription updateSubscriptionForUser(Long subscriptionId, SubscriptionRequest subscriptionRequest, AppUser user);

    void deleteSubscriptionForUser(Long subscriptionId, AppUser user);

    /**
     * Returns all subscriptions that belong to the given user.
     */
    java.util.List<Subscription> getSubscriptionsForUser(AppUser user);
}
