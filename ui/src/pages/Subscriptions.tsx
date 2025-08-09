import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { convertToMonthly, formatCurrency } from '../utils/currency';
import { apiRequest } from '../utils/api';
import { Loading, ErrorDisplay } from '../components/ApiStatus';
import type { Category, Subscription, PaginatedResponse, SubscriptionRequest } from '../types';

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
  const [userCurrency, setUserCurrency] = useState<'USD' | 'EUR'>('USD');

  useEffect(() => {
    fetch('/api/user/currency', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch currency')))
      .then(data => {
        const code = data?.currency;
        if (code === 'EUR' || code === 'USD') setUserCurrency(code);
      })
      .catch(() => {});
  }, []);

  // Fetch subscriptions only if authenticated
  const { data: subscriptionsPage, isLoading: subscriptionsLoading, error: subscriptionsError, refetch: refetchSubscriptions } = useQuery<PaginatedResponse<Subscription>>({
    queryKey: ['subscriptions'],
    queryFn: () => apiRequest<PaginatedResponse<Subscription>>('/api/subscriptions'),
    // Query will run automatically since route is protected
  });

  // Fetch categories only if authenticated
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiRequest<Category[]>('/api/categories'),
    // Query will run automatically since route is protected
  });

  // Extract data from paginated responses
  const safeSubscriptions = Array.isArray(subscriptionsPage?.content) ? subscriptionsPage.content : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Please enter a subscription name');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }
    
    if (!formData.nextBillingDate) {
      alert('Please select a next billing date');
      return;
    }
    
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }
    
    const subscriptionData: SubscriptionRequest = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      billingPeriod: formData.billingPeriod,
      nextBillingDate: formData.nextBillingDate,
      categoryId: parseInt(formData.categoryId),
      active: formData.active
    };

    if (editingSubscription) {
      updateMutation.mutate({ ...subscriptionData, id: editingSubscription.id });
    } else {
      createMutation.mutate(subscriptionData);
    }
  };

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

  const totalMonthlySpend = safeSubscriptions
    .filter((sub: Subscription) => sub.active)
    .reduce((total: number, sub: Subscription) => {
      return total + convertToMonthly(sub.price, sub.billingPeriod);
    }, 0);


  if (subscriptionsLoading || categoriesLoading) {
    return (
      <div style={{ padding: '2rem', color: 'white', minHeight: '100vh' }}>
        <Loading 
          message={subscriptionsLoading ? "Loading subscriptions..." : "Loading categories..."} 
          size="lg" 
        />
      </div>
    );
  }

  // Show error for API errors
  if (subscriptionsError || categoriesError) {
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
        
        <ErrorDisplay
          error={subscriptionsError || categoriesError!}
          onRetry={() => {
            refetchSubscriptions();
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          }}
          title="Unable to load data"
        />
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
            Manage your recurring subscriptions • {formatCurrency(totalMonthlySpend, userCurrency)}/month total
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
            
            {/* Error Display */}
            {(createMutation.error || updateMutation.error) && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: '#fca5a5'
              }}>
                <strong>Error:</strong> {(createMutation.error || updateMutation.error)?.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                  Subscription Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '1rem'
                  }}
                  placeholder="e.g., Netflix, Spotify"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '1rem'
                    }}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                    Billing Period
                  </label>
                  <select
                    value={formData.billingPeriod}
                    onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' })}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                    Next Billing Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextBillingDate}
                    onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">Select Category</option>
                    {safeCategories.map((category: Category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Active subscription
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSubscription(null);
                    resetForm();
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: (createMutation.isPending || updateMutation.isPending) ? 0.7 : 1
                  }}
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : editingSubscription ? 'Update' : 'Create'
                  }
                </button>
              </div>
            </form>
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
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredAndSortedSubscriptions.map((subscription: Subscription) => {
            const daysUntilBilling = Math.ceil(
              (new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return (
              <div
                key={subscription.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: subscription.categoryColor || '#8b5cf6'
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                        {subscription.name}
                      </h3>
                      {!subscription.active && (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#fca5a5',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontWeight: '600'
                        }}>
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        {subscription.categoryName}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        {daysUntilBilling > 0 
                          ? `Due in ${daysUntilBilling} days`
                          : daysUntilBilling === 0 
                            ? 'Due today'
                            : `Overdue by ${Math.abs(daysUntilBilling)} days`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>
                      {formatCurrency(subscription.price, userCurrency)}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {subscription.billingPeriod.toLowerCase()}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(subscription)}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id!)}
                      disabled={deleteMutation.isPending}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        opacity: deleteMutation.isPending ? 0.7 : 1
                      }}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;