package com.example.subtrackerproject.service;

import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Category;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
class CategoryLockedTest {

    @Autowired
    private TestEntityManager em;

    @Test
    void lockedCategoryIsImmutable() {
        AppUser user = new AppUser();
        user.setGoogleSub("sub");
        em.persist(user);

        Category cat = new Category();
        cat.setName("Subscriptions");
        cat.setColor("#fff");
        cat.setLocked(true);
        cat.setAppUser(user);
        em.persistAndFlush(cat);

        // attempt rename
        Assertions.assertThrows(IllegalStateException.class, cat::assertMutable);
    }
} 