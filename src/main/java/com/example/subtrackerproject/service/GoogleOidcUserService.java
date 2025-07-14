package com.example.subtrackerproject.service;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class GoogleOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final AppUserService appUserService;
    private final OidcUserService delegate = new OidcUserService();

    public GoogleOidcUserService(AppUserService appUserService) {
        this.appUserService = appUserService;
    }


    @Override
    public OidcUser loadUser(OidcUserRequest req) {
        OidcUser googleUser = delegate.loadUser(req);

        try {
            appUserService.processUserLogin(googleUser);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException("Failed to save or update user in the database");
        }
        return googleUser;
    }
}
