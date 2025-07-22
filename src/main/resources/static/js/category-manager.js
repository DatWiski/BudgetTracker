// Category Manager JavaScript - handles all category management functionality

(function() {
    const metaToken = () => document.querySelector('meta[name="google-id-token"]')?.content;
    
    // Form elements
    const addCategoryForm = document.getElementById('addCategoryForm');
    const editCategoryForm = document.getElementById('editCategoryForm');
    const categoryColor = document.getElementById('categoryColor');
    const categoryColorText = document.getElementById('categoryColorText');
    const editCategoryColor = document.getElementById('editCategoryColor');
    const editCategoryColorText = document.getElementById('editCategoryColorText');
    
    // Modal elements
    const addCategoryModal = document.getElementById('addCategoryModal');
    const editCategoryModal = document.getElementById('editCategoryModal');
    const deleteCategoryModal = document.getElementById('deleteCategoryModal');
    
    // Delete modal elements
    const deleteCategoryName = document.getElementById('deleteCategoryName');
    const subscriptionReassignSection = document.getElementById('subscriptionReassignSection');
    const subscriptionCount = document.getElementById('subscriptionCount');
    const reassignCategorySelect = document.getElementById('reassignCategorySelect');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    let categories = [];
    let editingCategoryId = null;
    let deletingCategoryId = null;

    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
        loadCategories();
        initializeEventListeners();
        setupColorInputs();
    });

    // Load categories from server
    async function loadCategories() {
        try {
            const token = metaToken();
            if (!token) return;

            const response = await fetch('/api/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                categories = await response.json();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Initialize event listeners
    function initializeEventListeners() {
        // Add category form
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', handleAddCategory);
        }

        // Edit category form
        if (editCategoryForm) {
            editCategoryForm.addEventListener('submit', handleEditCategory);
        }

        // Edit category buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('edit-category-btn')) {
                handleEditCategoryClick(e.target);
            }
        });

        // Delete category buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-category-btn')) {
                handleDeleteCategoryClick(e.target);
            }
        });

        // Confirm delete button
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
        }
    }

    // Setup color input synchronization
    function setupColorInputs() {
        // Add category color sync
        if (categoryColor && categoryColorText) {
            categoryColor.addEventListener('input', function() {
                categoryColorText.value = this.value;
            });
        }

        // Edit category color sync
        if (editCategoryColor && editCategoryColorText) {
            editCategoryColor.addEventListener('input', function() {
                editCategoryColorText.value = this.value;
            });
        }
    }

    // Handle add category form submission
    async function handleAddCategory(e) {
        e.preventDefault();
        
        const formData = new FormData(addCategoryForm);
        const categoryData = {
            name: formData.get('name'),
            color: formData.get('color')
        };

        try {
            const token = metaToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryData)
            });

            if (response.ok) {
                bootstrap.Modal.getInstance(addCategoryModal).hide();
                showNotification('Category created successfully!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                const error = await response.json();
                handleApiError(error);
            }
        } catch (error) {
            handleApiError({ message: error.message });
        }
    }

    // Handle edit category button click
    function handleEditCategoryClick(button) {
        editingCategoryId = button.dataset.id;
        const categoryName = button.dataset.name;
        const categoryColor = button.dataset.color;

        // Populate edit form
        document.getElementById('editCategoryName').value = categoryName;
        document.getElementById('editCategoryColor').value = categoryColor;
        document.getElementById('editCategoryColorText').value = categoryColor;
    }

    // Handle edit category form submission
    async function handleEditCategory(e) {
        e.preventDefault();
        
        const formData = new FormData(editCategoryForm);
        const categoryData = {
            name: formData.get('name'),
            color: formData.get('color')
        };

        try {
            const token = metaToken();
            if (!token) throw new Error('Authentication required');

            const response = await fetch(`/api/categories/${editingCategoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryData)
            });

            if (response.ok) {
                bootstrap.Modal.getInstance(editCategoryModal).hide();
                showNotification('Category updated successfully!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                const error = await response.json();
                handleApiError(error);
            }
        } catch (error) {
            handleApiError({ message: error.message });
        }
    }

    // Handle delete category button click
    function handleDeleteCategoryClick(button) {
        deletingCategoryId = button.dataset.id;
        const categoryName = button.dataset.name;
        const subCount = parseInt(button.dataset.count || '0');

        deleteCategoryName.textContent = categoryName;
        subscriptionCount.textContent = subCount;

        if (subCount > 0) {
            subscriptionReassignSection.style.display = 'block';
            populateReassignSelect(deletingCategoryId);
        } else {
            subscriptionReassignSection.style.display = 'none';
        }

        bootstrap.Modal.getOrCreateInstance(deleteCategoryModal).show();
    }

    // Populate reassign category select
    function populateReassignSelect(excludeCategoryId) {
        reassignCategorySelect.innerHTML = '<option value="">No category (Uncategorized)</option>';
        
        categories.forEach(category => {
            if (category.id != excludeCategoryId) {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                reassignCategorySelect.appendChild(option);
            }
        });
    }

    // Handle confirm delete
    async function handleConfirmDelete() {
        const newCategoryId = reassignCategorySelect.value || null;
        
        try {
            const token = metaToken();
            if (!token) throw new Error('Authentication required');

            const url = `/api/categories/${deletingCategoryId}${newCategoryId ? `?newCategoryId=${newCategoryId}` : ''}`;
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                bootstrap.Modal.getInstance(deleteCategoryModal).hide();
                showNotification('Category deleted successfully!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                const error = await response.json();
                handleApiError(error);
            }
        } catch (error) {
            handleApiError({ message: error.message });
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    // Handle API errors
    function handleApiError(error) {
        let message = 'An error occurred';
        
        if (error.message) {
            message = error.message;
        } else if (error.errors) {
            message = Object.values(error.errors).join(', ');
        }
        
        showNotification(message, 'danger');
    }

    // Reset forms when modals are hidden
    document.addEventListener('hidden.bs.modal', function(e) {
        if (e.target.id === 'addCategoryModal') {
            addCategoryForm.reset();
            document.getElementById('categoryColorText').value = '#FF6B6B';
        } else if (e.target.id === 'editCategoryModal') {
            editCategoryForm.reset();
            editingCategoryId = null;
        } else if (e.target.id === 'deleteCategoryModal') {
            deletingCategoryId = null;
        }
    });

    // Merge categories functionality (placeholder for future implementation)
    const mergeCategoriesBtn = document.getElementById('mergeCategoriesBtn');
    if (mergeCategoriesBtn) {
        mergeCategoriesBtn.addEventListener('click', function() {
            showNotification('Merge categories functionality coming soon!', 'info');
        });
    }

})(); 