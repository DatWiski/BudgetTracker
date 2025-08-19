package com.example.budgettracker.integration;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Period;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.repository.AppUserRepository;
import com.example.budgettracker.repository.CategoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class SubscriptionActiveFieldTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private CategoryRepository categoryRepository;




    private AppUser testUser;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testUser = new AppUser("test-google-sub", "Test User", "test@example.com", "http://example.com/pic.jpg");
        testUser = appUserRepository.save(testUser);

        testCategory = new Category("Entertainment", testUser);
        testCategory = categoryRepository.save(testCategory);
    }

    @Test
    void shouldCreateActiveSubscriptionByDefault() throws Exception {
        SubscriptionRequest request = new SubscriptionRequest();
        request.setName("Netflix");
        request.setPrice(new BigDecimal("15.99"));
        request.setPeriod(Period.MONTHLY);
        request.setNextBillingDate(LocalDate.now().plusMonths(1));
        request.setCategoryId(testCategory.getId());
        // Not setting active field - should default to true

        mockMvc.perform(post("/api/subscriptions")
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldCreateInactiveSubscriptionWhenSpecified() throws Exception {
        SubscriptionRequest request = new SubscriptionRequest();
        request.setName("Cancelled Netflix");
        request.setPrice(new BigDecimal("15.99"));
        request.setPeriod(Period.MONTHLY);
        request.setNextBillingDate(LocalDate.now().plusMonths(1));
        request.setCategoryId(testCategory.getId());
        request.setActive(false); // Explicitly set to inactive

        mockMvc.perform(post("/api/subscriptions")
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldUpdateSubscriptionActiveStatus() throws Exception {
        // Create an active subscription first
        SubscriptionRequest createRequest = new SubscriptionRequest();
        createRequest.setName("Test Subscription");
        createRequest.setPrice(new BigDecimal("10.00"));
        createRequest.setPeriod(Period.MONTHLY);
        createRequest.setNextBillingDate(LocalDate.now().plusMonths(1));
        createRequest.setCategoryId(testCategory.getId());
        createRequest.setActive(true);

        String createResponse = mockMvc.perform(post("/api/subscriptions")
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Extract subscription ID from response
        Long subscriptionId = objectMapper.readTree(createResponse).get("id").asLong();

        // Update to inactive
        SubscriptionRequest updateRequest = new SubscriptionRequest();
        updateRequest.setName("Test Subscription");
        updateRequest.setPrice(new BigDecimal("10.00"));
        updateRequest.setPeriod(Period.MONTHLY);
        updateRequest.setNextBillingDate(LocalDate.now().plusMonths(1));
        updateRequest.setCategoryId(testCategory.getId());
        updateRequest.setActive(false); // Change to inactive

        mockMvc.perform(put("/api/subscriptions/" + subscriptionId)
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldReturnBothActiveAndInactiveSubscriptionsInListing() throws Exception {
        // Create one active and one inactive subscription
        SubscriptionRequest activeRequest = new SubscriptionRequest();
        activeRequest.setName("Active Subscription");
        activeRequest.setPrice(new BigDecimal("10.00"));
        activeRequest.setPeriod(Period.MONTHLY);
        activeRequest.setNextBillingDate(LocalDate.now().plusMonths(1));
        activeRequest.setCategoryId(testCategory.getId());
        activeRequest.setActive(true);

        SubscriptionRequest inactiveRequest = new SubscriptionRequest();
        inactiveRequest.setName("Inactive Subscription");
        inactiveRequest.setPrice(new BigDecimal("20.00"));
        inactiveRequest.setPeriod(Period.YEARLY);
        inactiveRequest.setNextBillingDate(LocalDate.now().plusYears(1));
        inactiveRequest.setCategoryId(testCategory.getId());
        inactiveRequest.setActive(false);

        // Create both subscriptions
        mockMvc.perform(post("/api/subscriptions")
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(activeRequest)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/subscriptions")
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inactiveRequest)))
                .andExpect(status().isCreated());

        // List all subscriptions - should return both
        mockMvc.perform(get("/api/subscriptions")
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2));
    }
}