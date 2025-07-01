package com.example.subtrackerproject.service;

import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;

    @Transactional
    public void processUserLogin(OidcUser googleUser) {
        appUserRepository.findByGoogleSub(googleUser.getSubject())
                .map(user -> user.updateFromGoogle(
                        googleUser.getFullName(),
                        googleUser.getEmail(),
                        googleUser.getPicture()
                ))
                .orElseGet(() -> appUserRepository.save(
                        new AppUser(
                                googleUser.getSubject(),
                                googleUser.getFullName(),
                                googleUser.getEmail(),
                                googleUser.getPicture()
                        )
                ));
    }
    public Optional<AppUser> findByOidcUser(OidcUser oidcUser) {
        if (oidcUser == null) {
            return Optional.empty();
        }
        return appUserRepository.findByGoogleSub(oidcUser.getSubject());
    }
}