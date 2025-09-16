package com.example.budgettracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenRefreshResponse {
  private String accessToken;
  private long expiresIn;
  private UserInfo user;

  @Data
  @AllArgsConstructor
  public static class UserInfo {
    private Long id;
    private String email;
    private String name;
  }
}
