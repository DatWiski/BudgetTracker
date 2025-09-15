package com.example.budgettracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.budgettracker.TestDataBuilder;
import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.exception.SubscriptionNotFoundException;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.Period;
import com.example.budgettracker.model.Subscription;
import com.example.budgettracker.repository.SubscriptionRepository;
import com.example.budgettracker.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubscriptionService Tests")
class SubscriptionServiceTest {

  @Mock private SubscriptionRepository subscriptionRepository;
  @Mock private CategoryService categoryService;
  @Mock private SecurityUtils securityUtils;

  @InjectMocks private SubscriptionServiceImpl subscriptionService;

  private AppUser testUser;
  private Category testCategory;
  private Subscription testSubscription;
  private SubscriptionRequest testRequest;

  @BeforeEach
  void setUp() {
    testUser = TestDataBuilder.createTestUser();
    testCategory = TestDataBuilder.createTestCategory();
    testSubscription = TestDataBuilder.createTestSubscription();
    testRequest = TestDataBuilder.createValidSubscriptionRequest();
  }

  @Nested
  @DisplayName("Save Subscription Tests")
  class SaveSubscriptionTests {

    @Test
    @DisplayName("Should save subscription with specified category")
    void shouldSaveSubscriptionWithSpecifiedCategory() {
      when(categoryService.findByIdAndUser(testRequest.getCategoryId(), testUser))
          .thenReturn(testCategory);
      when(subscriptionRepository.save(any(Subscription.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      Subscription result = subscriptionService.saveSubscriptionForUser(testRequest, testUser);

      assertThat(result).isNotNull();
      assertThat(result.getName()).isEqualTo(testRequest.getName());
      assertThat(result.getPrice()).isEqualTo(testRequest.getPrice());
      assertThat(result.getPeriod()).isEqualTo(testRequest.getPeriod());
      assertThat(result.getNextBillingDate()).isEqualTo(testRequest.getNextBillingDate());
      assertThat(result.isActive()).isEqualTo(testRequest.isActive());
      assertThat(result.getAppUser()).isEqualTo(testUser);
      assertThat(result.getCategory()).isEqualTo(testCategory);

      verify(categoryService).findByIdAndUser(testRequest.getCategoryId(), testUser);
      verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    @DisplayName("Should save subscription with default category when no category specified")
    void shouldSaveSubscriptionWithDefaultCategory() {
      testRequest.setCategoryId(null);
      Category defaultCategory = TestDataBuilder.createTestCategory(2L, "Subscriptions", testUser);

      when(categoryService.findOrCreateCategory("Subscriptions", testUser))
          .thenReturn(defaultCategory);
      when(subscriptionRepository.save(any(Subscription.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      Subscription result = subscriptionService.saveSubscriptionForUser(testRequest, testUser);

      assertThat(result).isNotNull();
      assertThat(result.getCategory()).isEqualTo(defaultCategory);
      verify(categoryService).findOrCreateCategory("Subscriptions", testUser);
      verify(subscriptionRepository).save(any(Subscription.class));
    }
  }

  @Nested
  @DisplayName("Update Subscription Tests")
  class UpdateSubscriptionTests {

    @Test
    @DisplayName("Should update subscription successfully")
    void shouldUpdateSubscriptionSuccessfully() {
      Long subscriptionId = 1L;
      SubscriptionRequest updateRequest =
          TestDataBuilder.createSubscriptionRequest(
              "Disney+", new BigDecimal("8.99"), Period.MONTHLY, LocalDate.now().plusMonths(1), 1L);

      when(subscriptionRepository.findById(subscriptionId))
          .thenReturn(Optional.of(testSubscription));
      when(categoryService.findByIdAndUser(updateRequest.getCategoryId(), testUser))
          .thenReturn(testCategory);
      when(subscriptionRepository.save(any(Subscription.class))).thenReturn(testSubscription);

      Subscription result =
          subscriptionService.updateSubscriptionForUser(subscriptionId, updateRequest, testUser);

      assertThat(result).isNotNull();
      verify(securityUtils)
          .validateResourceOwnership(
              testSubscription.getAppUser(), testUser, "subscription", subscriptionId);
      verify(subscriptionRepository).save(testSubscription);
    }

    @Test
    @DisplayName("Should update subscription with default category when no category specified")
    void shouldUpdateSubscriptionWithDefaultCategory() {
      Long subscriptionId = 1L;
      testRequest.setCategoryId(null);
      Category defaultCategory = TestDataBuilder.createTestCategory(2L, "Subscriptions", testUser);

      when(subscriptionRepository.findById(subscriptionId))
          .thenReturn(Optional.of(testSubscription));
      when(categoryService.findOrCreateCategory("Subscriptions", testUser))
          .thenReturn(defaultCategory);
      when(subscriptionRepository.save(any(Subscription.class))).thenReturn(testSubscription);

      Subscription result =
          subscriptionService.updateSubscriptionForUser(subscriptionId, testRequest, testUser);

      assertThat(result).isNotNull();
      verify(categoryService).findOrCreateCategory("Subscriptions", testUser);
    }

    @Test
    @DisplayName("Should throw exception when subscription not found")
    void shouldThrowExceptionWhenSubscriptionNotFound() {
      Long subscriptionId = 999L;

      when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.empty());

      assertThatThrownBy(
              () ->
                  subscriptionService.updateSubscriptionForUser(
                      subscriptionId, testRequest, testUser))
          .isInstanceOf(SubscriptionNotFoundException.class)
          .hasMessage("Subscription not found with id: " + subscriptionId);
    }
  }

  @Nested
  @DisplayName("Delete Subscription Tests")
  class DeleteSubscriptionTests {

    @Test
    @DisplayName("Should delete subscription successfully")
    void shouldDeleteSubscriptionSuccessfully() {
      Long subscriptionId = 1L;

      when(subscriptionRepository.findById(subscriptionId))
          .thenReturn(Optional.of(testSubscription));

      subscriptionService.deleteSubscriptionForUser(subscriptionId, testUser);

      verify(securityUtils)
          .validateResourceOwnership(
              testSubscription.getAppUser(), testUser, "subscription", subscriptionId);
      verify(subscriptionRepository).delete(testSubscription);
    }

    @Test
    @DisplayName("Should throw exception when subscription not found for deletion")
    void shouldThrowExceptionWhenSubscriptionNotFoundForDeletion() {
      Long subscriptionId = 999L;

      when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.empty());

      assertThatThrownBy(
              () -> subscriptionService.deleteSubscriptionForUser(subscriptionId, testUser))
          .isInstanceOf(SubscriptionNotFoundException.class)
          .hasMessage("Subscription not found with id: " + subscriptionId);
    }
  }

  @Nested
  @DisplayName("Get Subscriptions Tests")
  class GetSubscriptionsTests {

    @Test
    @DisplayName("Should get all subscriptions for user")
    void shouldGetAllSubscriptionsForUser() {
      List<Subscription> subscriptions = List.of(testSubscription);

      when(subscriptionRepository.findByAppUser(testUser)).thenReturn(subscriptions);

      List<Subscription> result = subscriptionService.getSubscriptionsForUser(testUser);

      assertThat(result).hasSize(1);
      assertThat(result).contains(testSubscription);
      verify(subscriptionRepository).findByAppUser(testUser);
    }

    @Test
    @DisplayName("Should get paginated subscriptions for user")
    void shouldGetPaginatedSubscriptionsForUser() {
      Pageable pageable = PageRequest.of(0, 10);
      Page<Subscription> subscriptionPage = new PageImpl<>(List.of(testSubscription));

      when(subscriptionRepository.findByAppUser(testUser, pageable)).thenReturn(subscriptionPage);

      Page<Subscription> result = subscriptionService.getSubscriptionsForUser(testUser, pageable);

      assertThat(result.getContent()).hasSize(1);
      assertThat(result.getContent()).contains(testSubscription);
      verify(subscriptionRepository).findByAppUser(testUser, pageable);
    }

    @Test
    @DisplayName("Should return empty list when user has no subscriptions")
    void shouldReturnEmptyListWhenUserHasNoSubscriptions() {
      when(subscriptionRepository.findByAppUser(testUser)).thenReturn(List.of());

      List<Subscription> result = subscriptionService.getSubscriptionsForUser(testUser);

      assertThat(result).isEmpty();
      verify(subscriptionRepository).findByAppUser(testUser);
    }
  }
}
