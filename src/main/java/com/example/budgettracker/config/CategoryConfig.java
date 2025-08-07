package com.example.budgettracker.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "app.categories")
@Data
public class CategoryConfig {
    
    private Map<String, String> defaults;
    
    public Map<String, String> getDefaults() {
        if (defaults == null || defaults.isEmpty()) {
            // Fallback to hardcoded defaults if not configured
            return Map.of(
                "Entertainment", "#FF6B6B",
                "Productivity", "#4ECDC4", 
                "Utilities", "#45B7D1",
                "Education", "#96CEB4",
                "Fitness", "#FFEAA7"
            );
        }
        return defaults;
    }
}