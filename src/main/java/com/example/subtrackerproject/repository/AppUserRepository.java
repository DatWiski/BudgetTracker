package com.example.subtrackerproject.repository;

import com.example.subtrackerproject.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByGoogleSub(String googleSub);
}
