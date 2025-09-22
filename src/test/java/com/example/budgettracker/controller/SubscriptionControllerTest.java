package com.example.budgettracker.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.model.*;
import com.example.budgettracker.service.AppUserService;
import com.example.budgettracker.service.SubscriptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SubscriptionController.class)
class SubscriptionControllerTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean private SubscriptionService subscriptionService;

  @MockitoBean private AppUserService appUserService;

  @MockitoBean
  private com.example.budgettracker.service.GoogleOidcUserService
      googleOidcUserService; // Required by SecurityConfig

  @MockitoBean
  private com.example.budgettracker.service.PeriodCalculationService periodCalculationService;

  @MockitoBean
  private com.example.budgettracker.service.RefreshTokenService refreshTokenService;

  @MockitoBean
  private com.example.budgettracker.service.JwtService jwtService;

  private Jwt mockJwt;
  private AppUser mockAppUser;
  private SubscriptionRequest validRequest;

  @BeforeEach
  void setUp() {
    mockJwt = Jwt.withTokenValue("token").header("alg", "none").claim("sub", "google-123").build();

    mockAppUser = new AppUser("google-123", "Test User", "test@user.com", "pic.url");
    mockAppUser.setId(1L);

    validRequest = new SubscriptionRequest();
    validRequest.setName("Netflix");
    validRequest.setPrice(new BigDecimal("15.99"));
    validRequest.setPeriod(Period.MONTHLY);
    validRequest.setNextBillingDate(LocalDate.now().plusMonths(1));
    validRequest.setCategoryId(1L);
  }

  @Test
  void addSubscription_whenAuthenticatedAndValidData_shouldReturnCreated() throws Exception {
    when(appUserService.findByGoogleSub("google-123")).thenReturn(Optional.of(mockAppUser));

    Subscription savedSubscription = new Subscription();
    savedSubscription.setId(1L);
    savedSubscription.setName(validRequest.getName());
    savedSubscription.setPrice(validRequest.getPrice());
    savedSubscription.setAppUser(mockAppUser);
    Category category = new Category();
    category.setName("Entertainment");
    savedSubscription.setCategory(category);

    when(subscriptionService.saveSubscriptionForUser(
            any(SubscriptionRequest.class), eq(mockAppUser)))
        .thenReturn(savedSubscription);

    mockMvc
        .perform(
            post("/api/subscriptions")
                .with(jwt().jwt(mockJwt))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(1L))
        .andExpect(jsonPath("$.name").value("Netflix"))
        .andExpect(jsonPath("$.price").value(15.99))
        .andExpect(jsonPath("$.categoryName").value("Entertainment"));
  }

  @Test
  void addSubscription_whenUnauthenticated_shouldReturnUnauthorized() throws Exception {
    mockMvc
        .perform(
            post("/api/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest))
                .accept(MediaType.APPLICATION_JSON)
                .with(csrf())) // CSRF must be included if not authenticated via token
        .andExpect(status().is3xxRedirection());
  }

  @Test
  void addSubscription_whenInvalidData_shouldReturnBadRequest() throws Exception {
    validRequest.setName(""); // Invalid name

    mockMvc
        .perform(
            post("/api/subscriptions")
                .with(jwt().jwt(mockJwt))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void updateSubscription_whenAuthenticatedAndValidData_shouldReturnOk() throws Exception {
    when(appUserService.findByGoogleSub("google-123")).thenReturn(Optional.of(mockAppUser));

    Subscription updatedSubscription = new Subscription();
    updatedSubscription.setId(1L);
    updatedSubscription.setName("Updated");
    updatedSubscription.setPrice(validRequest.getPrice());
    when(subscriptionService.updateSubscriptionForUser(
            eq(1L), any(SubscriptionRequest.class), eq(mockAppUser)))
        .thenReturn(updatedSubscription);

    mockMvc
        .perform(
            put("/api/subscriptions/1")
                .with(jwt().jwt(mockJwt))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(1L));
  }

  @Test
  void deleteSubscription_whenAuthenticated_shouldReturnNoContent() throws Exception {
    when(appUserService.findByGoogleSub("google-123")).thenReturn(Optional.of(mockAppUser));

    mockMvc
        .perform(delete("/api/subscriptions/1").with(jwt().jwt(mockJwt)))
        .andExpect(status().isNoContent());
  }
}
