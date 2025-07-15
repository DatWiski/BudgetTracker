package com.example.subtrackerproject.repository;

import com.example.subtrackerproject.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByGoogleSub(String googleSub);
    
    @Query("SELECT u FROM AppUser u LEFT JOIN FETCH u.subscriptions s LEFT JOIN FETCH s.category WHERE u.googleSub = :googleSub")
    Optional<AppUser> findByGoogleSubWithSubscriptions(@Param("googleSub") String googleSub);
}
