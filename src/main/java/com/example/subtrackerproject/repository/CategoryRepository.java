package com.example.subtrackerproject.repository;

import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByNameIgnoreCaseAndAppUser(String name, AppUser appUser);
    
    List<Category> findByAppUserOrderByNameAsc(AppUser appUser);
    
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.category = :category AND s.isActive = true")
    long countActiveSubscriptionsByCategory(@Param("category") Category category);
    
    @Query("SELECT c FROM Category c WHERE c.appUser = :appUser AND c.name IN :reservedNames")
    List<Category> findReservedCategoriesByUser(@Param("appUser") AppUser appUser, @Param("reservedNames") List<String> reservedNames);
    
    @Query("SELECT c FROM Category c JOIN c.appUser u WHERE c.id = :categoryId AND u.id = :userId")
    Optional<Category> findByIdAndUserId(@Param("categoryId") Long categoryId, @Param("userId") Long userId);
}
