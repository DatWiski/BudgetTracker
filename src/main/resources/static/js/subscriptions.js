// JS for add / edit / delete subscription modal interactions
(function () {
    const metaToken = () => document.querySelector('meta[name="google-id-token"]')?.content;

    const modalEl = document.getElementById('addSubModal');
    if (!modalEl) return; // page not loaded yet

    const form = document.getElementById('addSubForm');
    const saveBtn = document.getElementById('saveSubBtn');
    const modalTitle = modalEl.querySelector('.modal-title');

    const deleteModalEl = document.getElementById('confirmDeleteModal');
    const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
    const deleteSubNameSpan = document.getElementById('deleteSubName');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    let mode = 'add';
    let editingId = null;

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

    function fillForm(btn) {
        form.name.value = btn.dataset.name;
        form.price.value = btn.dataset.price;
        form.billingPeriod.value = btn.dataset.billing;
        form.categoryName.value = btn.dataset.category || '';
        form.nextBillingDate.value = btn.dataset.nextdate || '';
    }

    modalEl.addEventListener('show.bs.modal', ev => {
        clearValidationErrors();
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
})(); 