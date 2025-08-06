import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Subscription {
  id?: number;
  name: string;
  price: number;
  billingPeriod: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  nextBillingDate: string;
  isActive: boolean;
  categoryId: number;
  categoryName?: string;
  categoryColor?: string;
}

interface SubscriptionFormData {
  name: string;
  price: string;
  billingPeriod: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  nextBillingDate: string;
  categoryId: string;
  isActive: boolean;
}

const Subscriptions = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch subscriptions only if authenticated
  const { data: subscriptions = [], isLoading: subscriptionsLoading, error: subscriptionsError } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await fetch('/api/subscriptions', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      return response.json();
    },
    enabled: isAuthenticated // Only run this query if authenticated
  });

  // Fetch categories only if authenticated
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    enabled: isAuthenticated // Only run this query if authenticated
  });

  // Create subscription mutation
  const createMutation = useMutation({
    mutationFn: async (subscription: Omit<Subscription, 'id'>) => {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subscription)
      });
      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setShowForm(false);
      resetForm();
    }
  });

  // Update subscription mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...subscription }: Subscription) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subscription)
      });
      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setShowForm(false);
      setEditingSubscription(null);
      resetForm();
    }
  });

  // Delete subscription mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete subscription');
      }
    },
    onSuccess: () => {
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
      isActive: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subscriptionData: Omit<Subscription, 'id'> = {
      name: formData.name,
      price: parseFloat(formData.price),
      billingPeriod: formData.billingPeriod,
      nextBillingDate: formData.nextBillingDate,
      categoryId: parseInt(formData.categoryId),
      isActive: formData.isActive
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
      isActive: subscription.isActive
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = subscriptions
    .filter((sub: Subscription) => {
      if (filterCategory !== 'all' && sub.categoryId !== parseInt(filterCategory)) {
        return false;
      }
      if (filterStatus !== 'all') {
        if (filterStatus === 'active' && !sub.isActive) return false;
        if (filterStatus === 'inactive' && sub.isActive) return false;
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

  const totalMonthlySpend = subscriptions
    .filter((sub: Subscription) => sub.isActive)
    .reduce((total: number, sub: Subscription) => {
      const monthlyAmount = sub.billingPeriod === 'YEARLY' ? sub.price / 12 : 
                           sub.billingPeriod === 'WEEKLY' ? sub.price * 4.33 : sub.price;
      return total + monthlyAmount;
    }, 0);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (useAuth will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (subscriptionsLoading || categoriesLoading) {
    return (
      <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
        <div>Loading subscriptions...</div>
      </div>
    );
  }

  // Show error only for actual API errors, not authentication issues
  if (subscriptionsError && isAuthenticated) {
    return (
      <div style={{ padding: '2rem', color: 'white', minHeight: '100vh' }}>
        {/* Header with Add Button - show even on error */}
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
              Manage your recurring subscriptions
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

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Unable to load subscriptions</h3>
          <p style={{ color: '#94a3b8' }}>There was an error loading your subscriptions. You can still add new ones using the button above.</p>
        </div>

        {/* Subscription Form Modal - same as below */}
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
                      onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value as 'MONTHLY' | 'YEARLY' | 'WEEKLY' })}
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
                      {categories.map((category: Category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
            Manage your recurring subscriptions • ${totalMonthlySpend.toFixed(2)}/month total
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

      {/* Filters - only show if we have subscriptions */}
      {filteredAndSortedSubscriptions.length > 0 && (
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
              {categories.map((category: Category) => (
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
                    onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value as 'MONTHLY' | 'YEARLY' | 'WEEKLY' })}
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
                    {categories.map((category: Category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
                      {!subscription.isActive && (
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
                      ${subscription.price.toFixed(2)}
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