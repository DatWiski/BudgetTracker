package com.example.subtrackerproject.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "category", 
    indexes = {
        @Index(name = "idx_category_user", columnList = "app_user_id"),
        @Index(name = "idx_category_name", columnList = "name")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_category_user_name", columnNames = {"app_user_id", "name"})
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 7)
    private String color;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser appUser;
    
    public Category(String name, String color, AppUser appUser) {
        this.name = name;
        this.color = color;
        this.appUser = appUser;
    }
}

