package com.example.budgettracker.service;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.repository.AppUserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppUserService {

  private final AppUserRepository appUserRepository;
  private final CategoryService categoryService;

  @Transactional
  public void processUserLogin(OidcUser googleUser) {
    AppUser user =
        appUserRepository
            .findByGoogleSub(googleUser.getSubject())
            .map(
                u ->
                    u.updateFromGoogle(
                        googleUser.getFullName(), googleUser.getEmail(), googleUser.getPicture()))
            .orElseGet(
                () -> {
                  AppUser newUser =
                      new AppUser(
                          googleUser.getSubject(),
                          googleUser.getFullName(),
                          googleUser.getEmail(),
                          googleUser.getPicture());
                  return appUserRepository.save(newUser);
                });

    // Ensure default categories exist for the user
    categoryService.ensureDefaultCategoriesExist(user);
  }

  public Optional<AppUser> findByOidcUser(OidcUser oidcUser) {
    if (oidcUser == null) {
      return Optional.empty();
    }
    // Use optimized query to fetch user with subscriptions
    return appUserRepository.findByGoogleSubWithSubscriptions(oidcUser.getSubject());
  }

  public Optional<AppUser> findByGoogleSub(String googleSub) {
    return appUserRepository.findByGoogleSub(googleSub);
  }

  public Optional<AppUser> findByGoogleSubWithSubscriptions(String googleSub) {
    return appUserRepository.findByGoogleSubWithSubscriptions(googleSub);
  }
}
