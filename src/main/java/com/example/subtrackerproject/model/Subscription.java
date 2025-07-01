package com.example.subtrackerproject.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String name;

    @Column(scale = 2, precision = 10)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private BillingPeriod billingPeriod;

    private LocalDate nextBillingDate;

    private boolean isActive = true;

    @ManyToOne
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser appUser;
}

