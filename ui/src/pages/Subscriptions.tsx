import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../utils/currency';
import { apiRequest } from '../utils/api';
import { Loading, ErrorDisplay } from '../components/ApiStatus';
import type { Category, Subscription, PaginatedResponse, SubscriptionRequest } from '../types';
import { useSubscriptionsData } from '../hooks/useSubscriptionsData';
import SubscriptionForm, { type SubscriptionFormValues } from '../components/subscriptions/SubscriptionForm';
import SubscriptionList from '../components/subscriptions/SubscriptionList';

interface SubscriptionFormData {
  name: string;
  price: string;
  billingPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
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
    billingPeriod: 'MONTHLY',
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
      billingPeriod: 'MONTHLY',
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
      billingPeriod: subscription.billingPeriod,
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
      <div style={{ padding: '2rem', color: 'white', minHeight: '100vh' }}>
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
      <div style={{ padding: '2rem', color: 'white', minHeight: '100vh' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}>
          Subscriptions
        </h1>
        
          <ErrorDisplay error={error as Error} onRetry={refetchAll} title="Unable to load data" />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Subscriptions
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Manage your recurring subscriptions • {formatCurrency(totalMonthlySpend, currency)}/month total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSubscription(null);
            resetForm();
            setShowForm(true);
          }}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
          }}
        >
          + Add Subscription
        </button>
      </div>

      {/* Filters - only show if we have any subscriptions */}
      {safeSubscriptions.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.875rem', marginRight: '0.5rem' }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'nextBillingDate')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="nextBillingDate">Next Billing</option>
            </select>
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.875rem', marginRight: '0.5rem' }}>Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Categories</option>
              {safeCategories.map((category: Category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.875rem', marginRight: '0.5rem' }}>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}

      {/* Subscription Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
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
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
          <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No subscriptions yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Start by adding your first subscription to track your recurring expenses.</p>
          <button
            onClick={() => {
              setEditingSubscription(null);
              resetForm();
              setShowForm(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}
          >
            + Add Your First Subscription
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