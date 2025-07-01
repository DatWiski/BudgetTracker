package com.example.subtrackerproject.repository;

import com.example.subtrackerproject.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
