package com.example.subtrackerproject.integration;

import com.example.subtrackerproject.dto.CategoryRequest;
import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.model.Subscription;
import com.example.subtrackerproject.repository.AppUserRepository;
import com.example.subtrackerproject.repository.CategoryRepository;
import com.example.subtrackerproject.repository.SubscriptionRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class CategoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    private AppUser testUser;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testUser = new AppUser("test-google-sub", "Test User", "test@example.com", "http://example.com/pic.jpg");
        testUser = appUserRepository.save(testUser);

        testCategory = new Category("Entertainment", "#FF6B6B", testUser);
        testCategory = categoryRepository.save(testCategory);
    }

    @Test
    void shouldCreateCategorySuccessfully() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Productivity");
        request.setColor("#4ECDC4");

        mockMvc.perform(post("/api/categories")
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Productivity"))
                .andExpect(jsonPath("$.color").value("#4ECDC4"));
    }

    @Test
    void shouldFailToCreateDuplicateCategory() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Entertainment"); // Already exists
        request.setColor("#FF6B6B");

        mockMvc.perform(post("/api/categories")
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldUpdateCategorySuccessfully() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Updated Entertainment");
        request.setColor("#123456");

        mockMvc.perform(put("/api/categories/" + testCategory.getId())
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Entertainment"))
                .andExpect(jsonPath("$.color").value("#123456"));
    }

    @Test
    void shouldDeleteCategoryAndReassignSubscriptions() throws Exception {
        Category newCategory = new Category("General", "#888888", testUser);
        newCategory = categoryRepository.save(newCategory);

        Subscription subscription = new Subscription();
        subscription.setAppUser(testUser);
        subscription.setCategory(testCategory);
        subscription.setName("Netflix");
        subscription = subscriptionRepository.save(subscription);

        mockMvc.perform(delete("/api/categories/" + testCategory.getId() + "?newCategoryId=" + newCategory.getId())
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub"))))
                .andExpect(status().isNoContent());

        Subscription updatedSubscription = subscriptionRepository.findById(subscription.getId()).orElseThrow();
        assertThat(updatedSubscription.getCategory().getId()).isEqualTo(newCategory.getId());
    }

    @Test
    void shouldReturnForbiddenWhenAccessingOtherUsersCategory() throws Exception {
        AppUser otherUser = new AppUser("other-sub", "Other User", "other@user.com", "pic");
        otherUser = appUserRepository.save(otherUser);

        Category otherUsersCategory = new Category("Private", "#000000", otherUser);
        otherUsersCategory = categoryRepository.save(otherUsersCategory);

        CategoryRequest request = new CategoryRequest();
        request.setName("Hacked");
        request.setColor("#123456");

        mockMvc.perform(put("/api/categories/" + otherUsersCategory.getId())
                        .with(jwt().jwt(jwt -> jwt.subject("test-google-sub")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound()); // Because the user cannot "find" it
    }
} 