package com.example.budgettracker.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Controller
public class OAuthController {

    @GetMapping("/oauth-complete")
    public void oauthComplete(HttpServletResponse response) throws IOException {
        // Return a simple HTML page that handles popup completion
        response.setContentType("text/html");
        response.getWriter().write("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Complete</title>
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%);
                        color: white; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        min-height: 100vh; 
                        margin: 0;
                    }
                    .container { text-align: center; }
                    .title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }
                    .subtitle { color: #94a3b8; font-size: 0.875rem; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="title">Completing login...</div>
                    <div class="subtitle">Please wait while we complete your authentication</div>
                </div>
                <script>
                    // Check if we're in a popup and communicate with parent
                    if (window.opener && window.opener !== window) {
                        // We're in a popup - tell parent window and close
                        window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, window.location.origin);
                        window.close();
                    } else {
                        // Not in popup, redirect to main app
                        window.location.href = '/';
                    }
                </script>
            </body>
            </html>
            """);
    }
}