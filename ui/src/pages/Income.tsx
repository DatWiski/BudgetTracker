

import { useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { Loading, ErrorDisplay } from '../components/ApiStatus';
import type { Category, Income, IncomeRequest } from '../types';
import { useIncomeData } from '../hooks/useIncomeData';
import IncomeForm, { type IncomeFormValues } from '../components/income/IncomeForm';
import IncomeList from '../components/income/IncomeList';
import { useCreateIncome, useUpdateIncome, useDeleteIncome } from '../hooks/useIncome';
import { Plus } from 'lucide-react';

interface IncomeFormData {
  name: string;
  amount: string;
  incomeDate: string;
  description?: string;
  categoryId?: string;
}

const IncomePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'incomeDate'>('incomeDate');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState<IncomeFormData>({
    name: '',
    amount: '',
    incomeDate: new Date().toISOString().split('T')[0], // Today's date
    description: '',
    categoryId: ''
  });

  const { safeIncome, safeCategories, currency, totalMonthlyIncome, isLoading, error, refetchAll } = useIncomeData();

  // Mutations
  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      incomeDate: new Date().toISOString().split('T')[0],
      description: '',
      categoryId: ''
    });
    createMutation.reset();
    updateMutation.reset();
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      name: income.name,
      amount: income.amount.toString(),
      incomeDate: income.incomeDate,
      description: income.description || '',
      categoryId: income.categoryId?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter and sort income
  const filteredAndSortedIncome = safeIncome
    .filter((income: Income) => {
      if (filterCategory !== 'all' && income.categoryId !== parseInt(filterCategory)) {
        return false;
      }
      return true;
    })
    .sort((a: Income, b: Income) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'incomeDate':
        default:
          return new Date(b.incomeDate).getTime() - new Date(a.incomeDate).getTime();
      }
    });

  if (isLoading) {
    return (
      <div className="p-8 text-white min-h-screen">
        <Loading 
          message={"Loading income data..."}
          size="lg" 
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-white min-h-screen">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-8">
          Income
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
            Income
          </h1>
          <p className="text-muted">
            Track your income sources and financial growth • {formatCurrency(totalMonthlyIncome, currency)}/month this month
          </p>
        </div>
        <button
          onClick={() => {
            setEditingIncome(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add Income
        </button>
      </div>

      {/* Filters - only show if we have any income entries */}
      {safeIncome.length > 0 && (
        <div className="glass-card mb-8">
          <div className="flex-wrap">
            <div className="flex items-center gap-2">
              <label className="form-label">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'name' | 'amount' | 'incomeDate')}
                className="form-select"
                style={{ width: '10rem' }}
              >
                <option value="incomeDate">Date</option>
                <option value="name">Name</option>
                <option value="amount">Amount</option>
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
          </div>
        </div>
      )}

      {/* Income Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingIncome ? 'Edit Income Entry' : 'Add New Income Entry'}
            </h2>
            
            <IncomeForm
              mode={editingIncome ? 'edit' : 'create'}
              values={formData as IncomeFormValues}
              onChange={(v) => setFormData(v)}
              categories={safeCategories as Category[]}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              onCancel={() => {
                setShowForm(false);
                setEditingIncome(null);
                resetForm();
              }}
              onSubmit={(payload) => {
                if ('id' in payload) {
                  updateMutation.mutate(payload as { id: number } & IncomeRequest, {
                    onSuccess: () => {
                      setShowForm(false);
                      setEditingIncome(null);
                      resetForm();
                    }
                  });
                } else {
                  createMutation.mutate(payload as IncomeRequest, {
                    onSuccess: () => {
                      setShowForm(false);
                      resetForm();
                    }
                  });
                }
              }}
              editingId={editingIncome?.id ?? null}
            />
          </div>
        </div>
      )}

      {/* Income List */}
      {filteredAndSortedIncome.length === 0 ? (
        <div className="placeholder-card">
          <div className="text-5xl mb-4">💰</div>
          <h3 className="heading-3 mb-2">No income entries yet</h3>
          <p className="text-muted text-base mb-6">
            Start by adding your first income entry to track your earnings.
          </p>
          <button
            onClick={() => {
              setEditingIncome(null);
              resetForm();
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Your First Income Entry
          </button>
        </div>
      ) : (
        <IncomeList
          income={filteredAndSortedIncome as Income[]}
          currency={currency}
          onEdit={handleEdit}
          onDelete={(id) => handleDelete(id)}
          deletingId={deleteMutation.isPending ? -1 : null}
        />
      )}
    </div>
  );
};

export default IncomePage;