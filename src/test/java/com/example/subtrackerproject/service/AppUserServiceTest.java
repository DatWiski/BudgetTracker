package com.example.subtrackerproject.service;

import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AppUserServiceTest {

    @Mock
    private AppUserRepository mockUserRepo;

    @InjectMocks
    private AppUserService appUserService;

    private OidcUser oidcUser;

    @BeforeEach
    void setUp() {
        oidcUser = mock(OidcUser.class);
        when(oidcUser.getSubject()).thenReturn("google123");
        when(oidcUser.getFullName()).thenReturn("Test User");
        when(oidcUser.getEmail()).thenReturn("test@example.com");
    }

    @Test
    void processUserLogin_shouldCreateNewUser_whenUserNotFound() {
        when(mockUserRepo.findByGoogleSub("google123")).thenReturn(Optional.empty());

        appUserService.processUserLogin(oidcUser);

        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(mockUserRepo).save(userCaptor.capture());

        assertEquals("Test User", userCaptor.getValue().getFullName());
    }

    @Test
    void processUserLogin_shouldUpdateExistingUser_whenUserFound() {
        AppUser existingUser = new AppUser("google123", "Old Name", "old@email.com", "old.pic");
        when(mockUserRepo.findByGoogleSub("google123")).thenReturn(Optional.of(existingUser));

        appUserService.processUserLogin(oidcUser);

        verify(mockUserRepo, never()).save(any());
        assertEquals("Test User", existingUser.getFullName());
    }
}
