package com.example.budgettracker.repository;

import com.example.budgettracker.model.RefreshToken;
import com.example.budgettracker.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    
    List<RefreshToken> findByAppUserAndExpiresAtAfter(AppUser appUser, LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.appUser = :user")
    void deleteAllByUser(@Param("user") AppUser user);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.tokenHash = :tokenHash")
    void deleteByTokenHash(@Param("tokenHash") String tokenHash);
    
    long countByAppUser(AppUser appUser);
}