// JS for add / edit / delete subscription modal interactions
(function () {
    const metaToken = () => document.querySelector('meta[name="google-id-token"]')?.content;
    const getUserCurrency = () => document.querySelector('meta[name="user-currency"]')?.content || 'USD';

    const modalEl = document.getElementById('addSubModal');
    if (!modalEl) return; // page not loaded yet

    const form = document.getElementById('addSubForm');
    const saveBtn = document.getElementById('saveSubBtn');
    const modalTitle = modalEl.querySelector('.modal-title');

    const deleteModalEl = document.getElementById('confirmDeleteModal');
    const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
    const deleteSubNameSpan = document.getElementById('deleteSubName');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Category management elements
    const categorySelect = document.getElementById('subCategory');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    const newCategorySection = document.getElementById('newCategorySection');
    const newCategoryName = document.getElementById('newCategoryName');
    const newCategoryColor = document.getElementById('newCategoryColor');
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    
    // Quick category management elements
    const quickCategoryModal = document.getElementById('quickCategoryModal');
    const quickCategoryList = document.getElementById('quickCategoryList');

    let mode = 'add';
    let editingId = null;
    let categories = [];

    function showNotification(message, type = 'success') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    function setLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || 'Save';
        }
    }

    function handleApiError(error, defaultMessage = 'An error occurred') {
        if (error.fieldErrors) {
            // Handle validation errors
            const fieldErrors = Object.entries(error.fieldErrors)
                .map(([field, message]) => `${field}: ${message}`)
                .join('<br>');
            showNotification(`Validation failed:<br>${fieldErrors}`, 'danger');
        } else {
            showNotification(error.message || defaultMessage, 'danger');
        }
    }

    function clearValidationErrors() {
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        document.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    }

    // Load categories from API
    async function loadCategories() {
        try {
            const token = metaToken();
            if (!token) return;

            const response = await fetch('/api/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                categories = await response.json();
                populateCategorySelect();
                return categories;
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
        return [];
    }

    // Populate category select dropdown
    function populateCategorySelect(selectedCategory = null) {
        const currentValue = selectedCategory || categorySelect.value;
        
        // Clear existing options except the first one
        categorySelect.innerHTML = '<option value="">Select a category</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            option.dataset.id = category.id;
            categorySelect.appendChild(option);
        });
        
        // Restore selected value if it exists
        if (currentValue) {
            categorySelect.value = currentValue;
        }
    }

    // Show/hide new category section
    function toggleNewCategorySection(show) {
        newCategorySection.style.display = show ? 'block' : 'none';
        addCategoryBtn.style.display = show ? 'none' : 'block';
        
        if (show) {
            newCategoryName.focus();
        } else {
            newCategoryName.value = '';
            newCategoryColor.value = '#FF6B6B';
        }
    }

    // Create new category
    async function createCategory() {
        const name = newCategoryName.value.trim();
        const color = newCategoryColor.value;
        
        if (!name) {
            showNotification('Category name is required', 'danger');
            return;
        }
        
        try {
            const token = metaToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, color })
            });

            if (response.ok) {
                const newCategory = await response.json();
                categories.push(newCategory);
                populateCategorySelect();
                categorySelect.value = newCategory.name;
                toggleNewCategorySection(false);
                showNotification('Category created successfully!');
            } else {
                const error = await response.json();
                handleApiError(error, 'Failed to create category');
            }
        } catch (error) {
            handleApiError({ message: error.message }, 'Network error occurred');
        }
    }

    // Initialize category functionality
    function initializeCategoryHandlers() {
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => toggleNewCategorySection(true));
        }
        
        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => toggleNewCategorySection(false));
        }
        
        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', createCategory);
        }
        
        if (newCategoryName) {
            newCategoryName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    createCategory();
                }
            });
        }
        
        // Quick category management
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', () => populateQuickCategoryList());
        }
    }
    
    // Populate quick category list
    function populateQuickCategoryList() {
        if (!quickCategoryList) return;
        
        quickCategoryList.innerHTML = '';
        
        categories.forEach(category => {
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            const isReserved = category.reserved || false;
            
            listItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="me-2" style="width: 16px; height: 16px; background-color: ${category.color}; border-radius: 50%; border: 1px solid #dee2e6;"></div>
                    <span class="category-name" data-id="${category.id}">${category.name}</span>
                    ${isReserved ? '<span class="badge bg-secondary ms-2">Reserved</span>' : ''}
                </div>
                <div class="btn-group btn-group-sm">
                    ${!isReserved ? `
                        <button class="btn btn-outline-primary btn-sm quick-edit-category" 
                                data-id="${category.id}" 
                                data-name="${category.name}" 
                                data-color="${category.color}">
                            Edit
                        </button>
                        <button class="btn btn-outline-danger btn-sm quick-delete-category" 
                                data-id="${category.id}" 
                                data-name="${category.name}"
                                data-count="${category.subscriptionCount || 0}">
                            Delete
                        </button>
                    ` : '<small class="text-muted">Protected</small>'}
                </div>
            `;
            
            quickCategoryList.appendChild(listItem);
        });
        
        // Add event listeners for quick actions
        quickCategoryList.addEventListener('click', handleQuickCategoryActions);
    }
    
    // Handle quick category actions
    function handleQuickCategoryActions(e) {
        if (e.target.classList.contains('quick-edit-category')) {
            handleQuickEditCategory(e.target);
        } else if (e.target.classList.contains('quick-delete-category')) {
            handleQuickDeleteCategory(e.target);
        }
    }
    
    // Handle quick edit category
    function handleQuickEditCategory(button) {
        const categoryId = button.dataset.id;
        const categoryName = button.dataset.name;
        const categoryColor = button.dataset.color;
        
        // Create inline edit form
        const listItem = button.closest('.list-group-item');
        const nameSpan = listItem.querySelector('.category-name');
        const colorDot = listItem.querySelector('div[style*="background-color"]');
        
        const originalContent = nameSpan.innerHTML;
        
        nameSpan.innerHTML = `
            <input type="text" class="form-control form-control-sm d-inline-block" 
                   style="width: 150px;" value="${categoryName}" id="edit-name-${categoryId}">
            <input type="color" class="form-control form-control-color form-control-sm d-inline-block ms-2" 
                   style="width: 40px; height: 31px;" value="${categoryColor}" id="edit-color-${categoryId}">
        `;
        
        button.textContent = 'Save';
        button.classList.remove('btn-outline-primary', 'quick-edit-category');
        button.classList.add('btn-success', 'quick-save-category');
        
        // Add cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline-secondary btn-sm';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => {
            nameSpan.innerHTML = originalContent;
            button.textContent = 'Edit';
            button.classList.remove('btn-success', 'quick-save-category');
            button.classList.add('btn-outline-primary', 'quick-edit-category');
            cancelBtn.remove();
        };
        
        button.parentNode.insertBefore(cancelBtn, button.nextSibling);
        
        // Handle save
        button.onclick = () => saveQuickEdit(categoryId, button, nameSpan, originalContent, cancelBtn);
    }
    
    // Save quick edit
    async function saveQuickEdit(categoryId, button, nameSpan, originalContent, cancelBtn) {
        const newName = document.getElementById(`edit-name-${categoryId}`).value.trim();
        const newColor = document.getElementById(`edit-color-${categoryId}`).value;
        
        if (!newName) {
            showNotification('Category name is required', 'danger');
            return;
        }
        
        try {
            const token = metaToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName, color: newColor })
            });

            if (response.ok) {
                // Update the category in the local array
                const categoryIndex = categories.findIndex(cat => cat.id == categoryId);
                if (categoryIndex !== -1) {
                    categories[categoryIndex].name = newName;
                    categories[categoryIndex].color = newColor;
                }
                
                // Update the display
                nameSpan.innerHTML = newName;
                nameSpan.previousElementSibling.style.backgroundColor = newColor;
                
                // Reset buttons
                button.textContent = 'Edit';
                button.classList.remove('btn-success', 'quick-save-category');
                button.classList.add('btn-outline-primary', 'quick-edit-category');
                button.onclick = null;
                cancelBtn.remove();
                
                // Update the main category dropdown
                populateCategorySelect();
                
                showNotification('Category updated successfully!');
            } else {
                const error = await response.json();
                handleApiError(error, 'Failed to update category');
            }
        } catch (error) {
            handleApiError({ message: error.message }, 'Network error occurred');
        }
    }
    
    // Handle quick delete category
    async function handleQuickDeleteCategory(button) {
        const categoryId = button.dataset.id;
        const categoryName = button.dataset.name;
        const subscriptionCount = parseInt(button.dataset.count) || 0;
        
        const confirmMessage = subscriptionCount > 0 
            ? `Are you sure you want to delete "${categoryName}"? This will remove the category from ${subscriptionCount} subscription(s).`
            : `Are you sure you want to delete "${categoryName}"?`;
        
        if (!confirm(confirmMessage)) return;
        
        try {
            const token = metaToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Remove from local array
                categories = categories.filter(cat => cat.id != categoryId);
                
                // Refresh the quick list
                populateQuickCategoryList();
                
                // Update the main category dropdown
                populateCategorySelect();
                
                showNotification('Category deleted successfully!');
            } else {
                const error = await response.json();
                handleApiError(error, 'Failed to delete category');
            }
        } catch (error) {
            handleApiError({ message: error.message }, 'Network error occurred');
        }
    }

    function fillForm(btn) {
        form.name.value = btn.dataset.name;
        form.price.value = btn.dataset.price;
        form.billingPeriod.value = btn.dataset.billing;
        form.nextBillingDate.value = btn.dataset.nextdate || '';
        
        // Set category after categories are loaded
        const categoryName = btn.dataset.category || '';
        populateCategorySelect(categoryName);
    }

    modalEl.addEventListener('show.bs.modal', ev => {
        clearValidationErrors();
        toggleNewCategorySection(false); // Ensure new category section is hidden
        loadCategories().then(() => {
            // Initialize Lucide icons in modal
            if (typeof lucide !== 'undefined') {
                setTimeout(() => lucide.createIcons(), 100);
            }
            
            const trigger = ev.relatedTarget;
            if (trigger && trigger.classList.contains('edit-sub-btn')) {
                mode = 'edit';
                editingId = trigger.dataset.id;
                modalTitle.textContent = 'Edit subscription';
                saveBtn.textContent = 'Save changes';
                saveBtn.dataset.originalText = 'Save changes';
                fillForm(trigger);
            } else {
                mode = 'add';
                editingId = null;
                modalTitle.textContent = 'Add Subscription';
                saveBtn.textContent = 'Save';
                saveBtn.dataset.originalText = 'Save';
                form.reset();
            }
        });
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        clearValidationErrors();
        setLoading(saveBtn, true);
        
        try {
            const token = metaToken();
            if (!token) throw new Error('Authentication required. Please refresh the page and try again.');

            const payload = Object.fromEntries(new FormData(form));
            let url = '/api/subscriptions';
            let method = 'POST';

            if (mode === 'edit' && editingId) {
                url += `/${editingId}`;
                method = 'PUT';
                
                // For editing, ensure billing date is not in the past
                const currentDate = new Date();
                const billingDate = new Date(payload.nextBillingDate);
                
                if (billingDate < currentDate) {
                    // If billing date is in the past, calculate next billing date
                    let nextDate = new Date();
                    switch (payload.billingPeriod) {
                        case 'DAILY':   nextDate.setDate(nextDate.getDate() + 1); break;
                        case 'WEEKLY':  nextDate.setDate(nextDate.getDate() + 7); break;
                        case 'MONTHLY': nextDate.setMonth(nextDate.getMonth() + 1); break;
                        case 'YEARLY':  nextDate.setFullYear(nextDate.getFullYear() + 1); break;
                    }
                    payload.nextBillingDate = nextDate.toISOString().split('T')[0];
                }
            } else {
                // compute nextBillingDate for new subscription
                let nextDate = new Date();
                switch (payload.billingPeriod) {
                    case 'DAILY':   nextDate.setDate(nextDate.getDate() + 1); break;
                    case 'WEEKLY':  nextDate.setDate(nextDate.getDate() + 7); break;
                    case 'MONTHLY': nextDate.setMonth(nextDate.getMonth() + 1); break;
                    case 'YEARLY':  nextDate.setFullYear(nextDate.getFullYear() + 1); break;
                }
                payload.nextBillingDate = nextDate.toISOString().split('T')[0];
            }

            const resp = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                bootstrap.Modal.getInstance(modalEl).hide();
                showNotification(`Subscription ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
                setTimeout(() => location.reload(), 1000);
            } else {
                const error = await resp.json().catch(() => ({ message: 'Request failed' }));
                handleApiError(error, `Failed to ${mode} subscription`);
            }
        } catch (err) {
            handleApiError({ message: err.message }, 'Network error occurred');
        } finally {
            setLoading(saveBtn, false);
        }
    });

    // delegate delete clicks
    document.addEventListener('click', ev => {
        if (ev.target.matches('.delete-sub-btn')) {
            const btn = ev.target;
            deleteSubNameSpan.textContent = btn.dataset.name;
            confirmDeleteBtn.dataset.id = btn.dataset.id;
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.dataset.originalText = 'Yes, delete';
            deleteModal.show();
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        const id = confirmDeleteBtn.dataset.id;
        setLoading(confirmDeleteBtn, true);
        
        try {
            const token = metaToken();
            if (!token) throw new Error('Authentication required. Please refresh the page and try again.');

            const resp = await fetch(`/api/subscriptions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (resp.status === 204) {
                deleteModal.hide();
                showNotification('Subscription deleted successfully!');
                setTimeout(() => location.reload(), 1000);
            } else {
                const error = await resp.json().catch(() => ({ message: 'Delete failed' }));
                handleApiError(error, 'Failed to delete subscription');
            }
        } catch (err) {
            handleApiError({ message: err.message }, 'Network error occurred');
        } finally {
            setLoading(confirmDeleteBtn, false);
        }
    });

    // Initialize category handlers
    initializeCategoryHandlers();
    
    // Initialize sorting functionality
    initializeSorting();
    
    // Calculate and display statistics
    function calculateStatistics() {
        try {
            const subscriptions = getSubscriptionsFromDOM();
            
            if (subscriptions.length === 0) return;
            
            // Calculate total monthly spending
            let totalMonthly = 0;
            
            subscriptions.forEach(sub => {
                const price = parseFloat(sub.price) || 0;
                const period = sub.billingPeriod;
                
                // Convert to monthly amount
                let monthlyAmount = price;
                switch (period) {
                    case 'DAILY':
                        monthlyAmount = price * 30;
                        break;
                    case 'WEEKLY':
                        monthlyAmount = price * 4.33;
                        break;
                    case 'MONTHLY':
                        monthlyAmount = price;
                        break;
                    case 'YEARLY':
                        monthlyAmount = price / 12;
                        break;
                }
                
                totalMonthly += monthlyAmount;
            });
            
            // Update DOM elements
            const totalSpendingEl = document.getElementById('totalSpending');
            
            // Get user's currency preference
            const userCurrency = getUserCurrency();
            const currencySymbol = userCurrency === 'EUR' ? '€' : '$';
            
            if (totalSpendingEl) {
                totalSpendingEl.textContent = currencySymbol + totalMonthly.toFixed(2);
            }
            
        } catch (error) {
            console.error('Error calculating statistics:', error);
        }
    }
    
    // Helper function to extract subscription data from DOM
    function getSubscriptionsFromDOM() {
        const subscriptions = [];
        const subscriptionCards = document.querySelectorAll('.subscription-card');
        
        subscriptionCards.forEach(card => {
            const priceText = card.querySelector('.subscription-price')?.textContent || '$0.00';
            const price = parseFloat(priceText.replace('$', '')) || 0;
            
            const periodText = card.querySelector('.subscription-period')?.textContent || '/monthly';
            const period = periodText.replace('/', '').toUpperCase();
            
            // Try to get next billing date from edit button data
            const editBtn = card.querySelector('.edit-sub-btn');
            const nextBillingDate = editBtn?.dataset?.nextdate || null;
            
            subscriptions.push({
                price: price,
                billingPeriod: period,
                nextBillingDate: nextBillingDate
            });
        });
        
        return subscriptions;
    }
    
    // Currency handling functions
    async function loadUserCurrency() {
        try {
            const response = await fetch('/api/user/currency', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${metaToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const currencySelect = document.getElementById('currencySelect');
                if (currencySelect) {
                    currencySelect.value = data.currency;
                    updateCurrencySymbol(data.currency);
                }
            }
        } catch (error) {
            console.error('Error loading user currency:', error);
        }
    }
    
    async function updateUserCurrency(currency) {
        try {
            const response = await fetch('/api/user/currency', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${metaToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currency: currency })
            });
            
            if (response.ok) {
                showNotification('Currency updated successfully!', 'success');
            } else {
                showNotification('Failed to update currency', 'danger');
            }
        } catch (error) {
            console.error('Error updating user currency:', error);
            showNotification('Error updating currency', 'danger');
        }
    }
    
    function updateCurrencySymbol(currency) {
        const currencySymbol = document.getElementById('currencySymbol');
        if (currencySymbol) {
            currencySymbol.textContent = currency === 'EUR' ? '€' : '$';
        }
    }
    

    
    // Initialize currency settings
    document.addEventListener('DOMContentLoaded', () => {
        // Set initial currency symbol based on user preference
        const userCurrency = getUserCurrency();
        updateCurrencySymbol(userCurrency);
        
        loadUserCurrency();
        
        // Settings modal handler
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', async () => {
                const currencySelect = document.getElementById('currencySelect');
                const selectedCurrency = currencySelect.value;
                
                await updateUserCurrency(selectedCurrency);
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
                modal.hide();
                
                // Refresh the page to update all currency displays
                location.reload();
            });
        }
    });

    // Sorting functionality
    function initializeSorting() {
        const sortOptions = document.querySelectorAll('.sort-option');
        sortOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const sortBy = e.target.dataset.sort;
                sortSubscriptions(sortBy);
            });
        });
    }
    
    function sortSubscriptions(sortBy) {
        const grid = document.querySelector('.subscription-grid');
        if (!grid) return;
        
        const cards = Array.from(grid.querySelectorAll('.subscription-card'));
        
        cards.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    const nameA = a.querySelector('.subscription-name').textContent.toLowerCase();
                    const nameB = b.querySelector('.subscription-name').textContent.toLowerCase();
                    return nameA.localeCompare(nameB);
                
                case 'name-desc':
                    const nameDescA = a.querySelector('.subscription-name').textContent.toLowerCase();
                    const nameDescB = b.querySelector('.subscription-name').textContent.toLowerCase();
                    return nameDescB.localeCompare(nameDescA);
                
                case 'price':
                    const priceA = parseFloat(a.querySelector('.subscription-price').textContent.replace(/[^0-9.]/g, '')) || 0;
                    const priceB = parseFloat(b.querySelector('.subscription-price').textContent.replace(/[^0-9.]/g, '')) || 0;
                    return priceA - priceB;
                
                case 'price-desc':
                    const priceDescA = parseFloat(a.querySelector('.subscription-price').textContent.replace(/[^0-9.]/g, '')) || 0;
                    const priceDescB = parseFloat(b.querySelector('.subscription-price').textContent.replace(/[^0-9.]/g, '')) || 0;
                    return priceDescB - priceDescA;
                
                case 'category':
                    const categoryA = a.querySelector('.subscription-category span:last-child')?.textContent.toLowerCase() || 'zzz';
                    const categoryB = b.querySelector('.subscription-category span:last-child')?.textContent.toLowerCase() || 'zzz';
                    return categoryA.localeCompare(categoryB);
                
                case 'billing-date':
                    const billingA = a.querySelector('.subscription-billing')?.textContent || '';
                    const billingB = b.querySelector('.subscription-billing')?.textContent || '';
                    
                    if (!billingA && !billingB) return 0;
                    if (!billingA) return 1;
                    if (!billingB) return -1;
                    
                    const dateA = new Date(billingA.replace('Next: ', ''));
                    const dateB = new Date(billingB.replace('Next: ', ''));
                    return dateA - dateB;
                
                default:
                    return 0;
            }
        });
        
        // Clear and re-append sorted cards
        grid.innerHTML = '';
        cards.forEach(card => grid.appendChild(card));
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Initialize statistics on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', calculateStatistics);
    } else {
        calculateStatistics();
    }
})(); 