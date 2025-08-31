package com.example.budgettracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "bill",
    indexes = {
      @Index(name = "idx_bill_user", columnList = "app_user_id"),
      @Index(name = "idx_bill_due_date", columnList = "dueDate"),
      @Index(name = "idx_bill_active", columnList = "is_active")
    })
@Getter
@Setter
@NoArgsConstructor
public class Bill extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(precision = 10, scale = 2)
  private BigDecimal amount;

  @Enumerated(EnumType.STRING)
  private Period period;

  private LocalDate dueDate;

  @Column(name = "is_active")
  private boolean active = true;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  private Category category;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "app_user_id", nullable = false)
  private AppUser appUser;
}
