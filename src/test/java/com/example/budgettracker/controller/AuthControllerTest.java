package com.example.budgettracker.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.budgettracker.config.TestSecurityConfig;
import com.example.budgettracker.service.AppUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import(TestSecurityConfig.class)
@TestPropertySource(
    properties = {"GOOGLE_CLIENT_ID=test-client-id", "GOOGLE_CLIENT_SECRET=test-client-secret"})
class AuthControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private ClientRegistrationRepository clientRegistrationRepository;

  @MockBean private AppUserService appUserService;

  @Test
  @WithMockUser(username = "test@example.com")
  void testAuthStatusWhenAuthenticated() throws Exception {
    mockMvc
        .perform(get("/api/auth/status"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.authenticated").value(true))
        .andExpect(jsonPath("$.username").value("test@example.com"));
  }

  @Test
  void testAuthStatusWhenNotAuthenticated() throws Exception {
    mockMvc
        .perform(get("/api/auth/status"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.authenticated").value(false))
        .andExpect(jsonPath("$.username").doesNotExist());
  }
}
