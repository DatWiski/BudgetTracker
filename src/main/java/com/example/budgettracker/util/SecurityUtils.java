package com.example.budgettracker.util;

import com.example.budgettracker.exception.UnauthorizedAccessException;
import com.example.budgettracker.model.AppUser;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public void validateResourceOwnership(AppUser resourceOwner, AppUser requester, String resourceType, Long resourceId) {
        if (!resourceOwner.getId().equals(requester.getId())) {
            throw new UnauthorizedAccessException(resourceType + " " + resourceId, requester.getId());
        }
    }

    public void validateResourceOwnership(Long ownerId, AppUser requester, String resourceType, Long resourceId) {
        if (!ownerId.equals(requester.getId())) {
            throw new UnauthorizedAccessException(resourceType + " " + resourceId, requester.getId());
        }
    }

    public boolean isResourceOwner(AppUser resourceOwner, AppUser requester) {
        return resourceOwner.getId().equals(requester.getId());
    }

    public boolean isResourceOwner(Long ownerId, AppUser requester) {
        return ownerId.equals(requester.getId());
    }
}