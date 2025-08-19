package com.example.budgettracker.controller;

import com.example.budgettracker.service.AppUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.mockito.Mock;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CsrfController.class)
@TestPropertySource(properties = {
    "GOOGLE_CLIENT_ID=test-client-id", 
    "GOOGLE_CLIENT_SECRET=test-client-secret"
})
class CsrfControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private ClientRegistrationRepository clientRegistrationRepository;
    
    @Mock
    private AppUserService appUserService;

    @Test
    @WithMockUser
    void testCsrfTokenEndpoint() throws Exception {
        mockMvc.perform(get("/api/csrf-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"));
    }
}