package com.example.budgettracker.repository;

import com.example.budgettracker.model.AppUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
  Optional<AppUser> findByGoogleSub(String googleSub);

  @Query(
      "SELECT DISTINCT u FROM AppUser u LEFT JOIN FETCH u.subscriptions s LEFT JOIN FETCH s.category WHERE u.googleSub = :googleSub")
  Optional<AppUser> findByGoogleSubWithSubscriptions(@Param("googleSub") String googleSub);
}
