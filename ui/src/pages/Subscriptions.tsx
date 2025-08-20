import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../utils/currency';
import { apiRequest } from '../utils/api';
import { Loading, ErrorDisplay } from '../components/ApiStatus';
import type { Category, Subscription, PaginatedResponse, SubscriptionRequest, Period } from '../types';
import { useSubscriptionsData } from '../hooks/useSubscriptionsData';
import SubscriptionForm, { type SubscriptionFormValues } from '../components/subscriptions/SubscriptionForm';
import SubscriptionList from '../components/subscriptions/SubscriptionList';
// Removed shadcn/ui imports - using custom components
import { Plus } from 'lucide-react';

interface SubscriptionFormData {
  name: string;
  price: string;
  period: Period;
  nextBillingDate: string;
  categoryId: string;
  active: boolean;
}

const Subscriptions = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'nextBillingDate'>('name');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: '',
    price: '',
    period: 'MONTHLY',
    nextBillingDate: '',
    categoryId: '',
    active: true
  });

  const queryClient = useQueryClient();
  const { safeSubscriptions, safeCategories, currency, totalMonthlySpend, isLoading, error, refetchAll } = useSubscriptionsData();

  // Fetching moved to useSubscriptionsData

  // Create subscription mutation
  const createMutation = useMutation({
    mutationFn: (subscription: SubscriptionRequest) => 
      apiRequest('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify(subscription)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Create subscription error:', error);
    }
  });

  // Update subscription mutation
  const updateMutation = useMutation({
    mutationFn: (payload: { id: number } & SubscriptionRequest) =>
      apiRequest(`/api/subscriptions/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
      setShowForm(false);
      setEditingSubscription(null);
      resetForm();
    },
    onError: (error) => {
      console.error('Update subscription error:', error);
    }
  });

  // Delete subscription mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/subscriptions/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: (_, deletedId) => {
      // Optimistically remove the deleted subscription from cache
      queryClient.setQueryData(['subscriptions'], (oldData: PaginatedResponse<Subscription> | undefined) => {
        if (!oldData?.content) return oldData;
        return {
          ...oldData,
          content: oldData.content.filter(sub => sub.id !== deletedId),
          totalElements: (oldData.totalElements || 0) - 1
        };
      });
      // Also invalidate to ensure fresh data on next refetch
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    },
    onError: (error) => {
      console.error('Delete subscription error:', error);
      // On error, invalidate to refetch correct data
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      period: 'MONTHLY',
      nextBillingDate: '',
      categoryId: '',
      active: true
    });
    // Clear any previous errors
    createMutation.reset();
    updateMutation.reset();
  };

  // submit handled inside SubscriptionForm via onSubmit callback

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      price: subscription.price.toString(),
      period: subscription.period,
      nextBillingDate: subscription.nextBillingDate,
      categoryId: subscription.categoryId.toString(),
      active: subscription.active
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = safeSubscriptions
    .filter((sub: Subscription) => {
      if (filterCategory !== 'all' && sub.categoryId !== parseInt(filterCategory)) {
        return false;
      }
      if (filterStatus !== 'all') {
        if (filterStatus === 'active' && !sub.active) return false;
        if (filterStatus === 'inactive' && sub.active) return false;
      }
      return true;
    })
    .sort((a: Subscription, b: Subscription) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'nextBillingDate':
          return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // totalMonthlySpend from hook


  // remove stray references; using hook state now
  if (isLoading) {
    return (
      <div className="p-8 text-white min-h-screen">
        <Loading 
          message={"Loading subscriptions..."}
          size="lg" 
        />
      </div>
    );
  }

  // Show error for API errors
  if (error) {
    return (
      <div className="p-8 text-white min-h-screen">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-8">
          Subscriptions
        </h1>
        
        <ErrorDisplay error={error as Error} onRetry={refetchAll} title="Unable to load data" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex-between mb-8">
        <div>
          <h1 className="heading-2 text-gradient">
            Subscriptions
          </h1>
          <p className="text-muted">
            Manage your recurring subscriptions • {formatCurrency(totalMonthlySpend, currency)}/month total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSubscription(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add Subscription
        </button>
      </div>

      {/* Filters - only show if we have any subscriptions */}
      {safeSubscriptions.length > 0 && (
        <div className="glass-card mb-8">
          <div className="flex-wrap">
            <div className="flex items-center gap-2">
              <label className="form-label">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'nextBillingDate')}
                className="form-select"
style={{ width: '10rem' }}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="nextBillingDate">Next Billing</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="form-label">Category:</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="form-select"
style={{ width: '12rem' }}
              >
                <option value="all">All Categories</option>
                {safeCategories.map((category: Category) => (
                  <option key={category.id} value={category.id.toString()}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="form-label">Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="form-select"
style={{ width: '8rem' }}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
            </h2>
            
            <SubscriptionForm
              mode={editingSubscription ? 'edit' : 'create'}
              values={formData as SubscriptionFormValues}
              onChange={(v) => setFormData(v)}
              categories={safeCategories as Category[]}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              onCancel={() => {
                setShowForm(false);
                setEditingSubscription(null);
                resetForm();
              }}
              onSubmit={(payload) => {
                if ('id' in payload) {
                  updateMutation.mutate(payload as { id: number } & SubscriptionRequest);
                } else {
                  createMutation.mutate(payload as SubscriptionRequest);
                }
              }}
              editingId={editingSubscription?.id ?? null}
            />
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      {filteredAndSortedSubscriptions.length === 0 ? (
        <div className="placeholder-card">
          <div className="text-5xl mb-4">📱</div>
          <h3 className="heading-3 mb-2">No subscriptions yet</h3>
          <p className="text-muted text-base mb-6">
            Start by adding your first subscription to track your recurring expenses.
          </p>
          <button
            onClick={() => {
              setEditingSubscription(null);
              resetForm();
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Your First Subscription
          </button>
        </div>
      ) : (
        <SubscriptionList
          subscriptions={filteredAndSortedSubscriptions as Subscription[]}
          currency={currency}
          onEdit={handleEdit}
          onDelete={(id) => handleDelete(id)}
          deletingId={deleteMutation.isPending ? -1 : null}
        />
      )}
    </div>
  );
};

export default Subscriptions;