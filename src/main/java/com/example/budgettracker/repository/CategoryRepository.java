package com.example.budgettracker.repository;

import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByNameIgnoreCaseAndAppUser(String name, AppUser appUser);
    
    List<Category> findByAppUserOrderByNameAsc(AppUser appUser);
    
    List<Category> findByAppUserAndCategoryTypeOrderByNameAsc(AppUser appUser, CategoryType categoryType);
    
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.category = :category AND s.active = true")
    long countActiveSubscriptionsByCategory(@Param("category") Category category);
    
    @Query("SELECT c FROM Category c WHERE c.appUser = :appUser AND c.name IN :reservedNames")
    List<Category> findReservedCategoriesByUser(@Param("appUser") AppUser appUser, @Param("reservedNames") List<String> reservedNames);
    
    @Query("SELECT c FROM Category c JOIN c.appUser u WHERE c.id = :categoryId AND u.id = :userId")
    Optional<Category> findByIdAndUserId(@Param("categoryId") Long categoryId, @Param("userId") Long userId);

    // Bulk count of active subscriptions per category for a given user to avoid N+1 queries
    @Query("SELECT c.id, COUNT(s.id) FROM Category c LEFT JOIN Subscription s ON s.category = c "
           + "AND s.active = true WHERE c.appUser = :appUser GROUP BY c.id")
    List<Object[]> countActiveSubscriptionsByUserGrouped(@Param("appUser") AppUser appUser);
}
