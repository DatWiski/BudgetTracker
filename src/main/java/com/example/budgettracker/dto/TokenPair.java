package com.example.budgettracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenPair {
  private String accessToken;
  private String refreshToken;
  private long accessTokenExpiresIn; // seconds until expiry
}
