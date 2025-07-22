package com.example.subtrackerproject.controller;

import com.example.subtrackerproject.service.AppUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequiredArgsConstructor
public class HomeController {

    private final AppUserService appUserService;

    @GetMapping("/")
    public String home(@AuthenticationPrincipal OidcUser principal, Model model) {
        model.addAttribute("subscriptions", java.util.Collections.emptyList());
        model.addAttribute("userCurrency", "USD"); // Default currency

        if (principal != null) {
            appUserService.findByOidcUser(principal)
                    .ifPresent(u -> {
                        model.addAttribute("subscriptions", u.getSubscriptions());
                        model.addAttribute("userCurrency", u.getCurrency());
                    });
        }
        return "home";
    }

}

