-- Re-point every Subscription row to the new system category
UPDATE subscription s
SET category_id = (
    SELECT c.id FROM category c
    WHERE c.app_user_id = s.app_user_id AND lower(c.name) = 'subscriptions'
)
WHERE EXISTS (
    SELECT 1 FROM category c
    WHERE c.id = s.category_id
      AND lower(c.name) <> 'subscriptions'
); 