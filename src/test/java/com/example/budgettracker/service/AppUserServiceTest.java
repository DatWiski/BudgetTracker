package com.example.budgettracker.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.repository.AppUserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

@ExtendWith(MockitoExtension.class)
class AppUserServiceTest {

  @Mock private AppUserRepository mockUserRepo;

  @Mock private CategoryService categoryService;

  @InjectMocks private AppUserService appUserService;

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

    ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
    AppUser savedUser = new AppUser("google123", "Test User", "test@example.com", null);
    when(mockUserRepo.save(userCaptor.capture())).thenReturn(savedUser);

    appUserService.processUserLogin(oidcUser);

    verify(mockUserRepo).save(any(AppUser.class));
    verify(categoryService).ensureDefaultCategoriesExist(any(AppUser.class));

    AppUser capturedUser = userCaptor.getValue();
    assertEquals("google123", capturedUser.getGoogleSub());
    assertEquals("Test User", capturedUser.getFullName());
    assertEquals("test@example.com", capturedUser.getEmail());
  }

  @Test
  void processUserLogin_shouldUpdateExistingUser_whenUserFound() {
    AppUser existingUser = new AppUser("google123", "Old Name", "old@example.com", null);
    when(mockUserRepo.findByGoogleSub("google123")).thenReturn(Optional.of(existingUser));

    appUserService.processUserLogin(oidcUser);

    verify(mockUserRepo, never()).save(any(AppUser.class));
    verify(categoryService).ensureDefaultCategoriesExist(existingUser);

    assertEquals("Test User", existingUser.getFullName());
    assertEquals("test@example.com", existingUser.getEmail());
  }
}
