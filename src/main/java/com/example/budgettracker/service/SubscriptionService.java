package com.example.budgettracker.service;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SubscriptionService {

  Subscription saveSubscriptionForUser(SubscriptionRequest subscriptionRequest, AppUser user);

  Subscription updateSubscriptionForUser(
      Long subscriptionId, SubscriptionRequest subscriptionRequest, AppUser user);

  void deleteSubscriptionForUser(Long subscriptionId, AppUser user);

  /** Returns all subscriptions that belong to the given user. */
  java.util.List<Subscription> getSubscriptionsForUser(AppUser user);

  /** Returns paginated subscriptions that belong to the given user. */
  Page<Subscription> getSubscriptionsForUser(AppUser user, Pageable pageable);
}
