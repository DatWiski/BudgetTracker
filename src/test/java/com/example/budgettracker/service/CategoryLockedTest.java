package com.example.budgettracker.service;

import com.example.budgettracker.exception.CategoryLockedException;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Category;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@org.springframework.test.context.TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
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
        Assertions.assertThrows(CategoryLockedException.class, cat::assertMutable);
    }
} 