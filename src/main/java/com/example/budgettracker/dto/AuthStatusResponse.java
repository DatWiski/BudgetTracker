package com.example.budgettracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthStatusResponse {
  private boolean authenticated;
  private String username;
  private String env;

  public AuthStatusResponse(boolean authenticated, String username) {
    this.authenticated = authenticated;
    this.username = username;
  }
}
