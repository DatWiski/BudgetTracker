package com.example.subtrackerproject.controller;

import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.Instant;
import java.util.Map;

public class TestUtils {

    public static OidcUser createMockOidcUser() {
        OidcIdToken idToken = new OidcIdToken("token-value", Instant.now(), Instant.now().plusSeconds(60),
                Map.of("sub", "google-123", "name", "Test User"));
        OidcUserInfo userInfo = new OidcUserInfo(Map.of("email", "test@user.com", "picture", "pic.url", "name", "Test User", "given_name", "Test"));
        return new DefaultOidcUser(null, idToken, userInfo);
    }
}
