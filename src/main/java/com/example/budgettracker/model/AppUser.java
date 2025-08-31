package com.example.budgettracker.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
public class AppUser extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "google_sub", nullable = false, unique = true)
  private String googleSub;

  private String email;
  private String fullName;
  private String pictureUrl;

  @Column(nullable = false)
  private String currency = "USD";

  @OneToMany(mappedBy = "appUser", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Subscription> subscriptions = new ArrayList<>();

  public AppUser(String sub, String name, String email, String pic) {
    this.googleSub = sub;
    this.fullName = name;
    this.email = email;
    this.pictureUrl = pic;
    this.currency = "USD"; // Default currency
  }

  public AppUser updateFromGoogle(String name, String userEmail, String pic) {
    this.fullName = name;
    this.email = userEmail;
    this.pictureUrl = pic;
    return this;
  }
}
