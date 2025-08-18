package com.example.budgettracker.model;

import com.example.budgettracker.exception.CategoryLockedException;
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
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean locked = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "category_type", nullable = false)
    private CategoryType categoryType = CategoryType.SUBSCRIPTION;

    public void assertMutable() {
        if (locked) {
            throw new CategoryLockedException(this.name);
        }
    }
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser appUser;
    
    public Category(String name, AppUser appUser) {
        this.name = name;
        this.appUser = appUser;
    }
}

