import { useState } from "react";
import { formatCurrency } from "../utils/currency";
import { Loading, ErrorDisplay } from "../components/ApiStatus";
import type { Bill, BillRequest, Category, Period } from "../types";
import { useBillsData } from "../hooks/useBillsData";
import BillForm, { type BillFormValues } from "../components/bills/BillForm";
import BillList from "../components/bills/BillList";
import { useCreateBill, useUpdateBill, useDeleteBill } from "../hooks/useBills";
import { Plus } from "lucide-react";

interface BillFormData {
  name: string;
  amount: string;
  period: Period;
  dueDate: string;
  categoryId: string;
  active: boolean;
}

const Bills = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "amount" | "dueDate">("name");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [formData, setFormData] = useState<BillFormData>({
    name: "",
    amount: "",
    period: "MONTHLY",
    dueDate: "",
    categoryId: "",
    active: true,
  });

  const { safeBills, safeCategories, currency, totalMonthlySpend, isLoading, error, refetchAll } =
    useBillsData();

  // Mutations
  const createMutation = useCreateBill();
  const updateMutation = useUpdateBill();
  const deleteMutation = useDeleteBill();

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      period: "MONTHLY",
      dueDate: "",
      categoryId: "",
      active: true,
    });
    createMutation.reset();
    updateMutation.reset();
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      period: bill.period,
      dueDate: bill.dueDate,
      categoryId: bill.categoryId.toString(),
      active: bill.active,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter and sort bills
  const filteredAndSortedBills = safeBills
    .filter((bill: Bill) => {
      if (filterCategory !== "all" && bill.categoryId !== parseInt(filterCategory)) {
        return false;
      }
      if (filterStatus !== "all") {
        if (filterStatus === "active" && !bill.active) return false;
        if (filterStatus === "inactive" && bill.active) return false;
      }
      return true;
    })
    .sort((a: Bill, b: Bill) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "dueDate":
          return new Date(a.actualDueDate).getTime() - new Date(b.actualDueDate).getTime();
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (isLoading) {
    return (
      <div className="p-8 text-white min-h-screen">
        <Loading message={"Loading bills data..."} size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-white min-h-screen">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-8">
          Bills
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
          <h1 className="heading-2 text-gradient">Bills</h1>
          <p className="text-muted">
            Track your recurring bills and fixed expenses •{" "}
            {formatCurrency(totalMonthlySpend, currency)}/month
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add Bill
        </button>
      </div>

      {/* Filters - only show if we have any bills */}
      {safeBills.length > 0 && (
        <div className="glass-card mb-8">
          <div className="flex-wrap">
            <div className="flex items-center gap-2">
              <label className="form-label">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "amount" | "dueDate")}
                className="form-select"
                style={{ width: "10rem" }}
              >
                <option value="name">Name</option>
                <option value="amount">Amount</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="form-label">Category:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="form-select"
                style={{ width: "12rem" }}
              >
                <option value="all">All Categories</option>
                {safeCategories.map((category: Category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="form-label">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                className="form-select"
                style={{ width: "8rem" }}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bill Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingBill ? "Edit Bill" : "Add New Bill"}</h2>

            <BillForm
              mode={editingBill ? "edit" : "create"}
              values={formData as BillFormValues}
              onChange={(v) => setFormData(v)}
              categories={safeCategories as Category[]}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              onCancel={() => {
                setShowForm(false);
                setEditingBill(null);
                resetForm();
              }}
              onSubmit={(payload) => {
                if ("id" in payload) {
                  updateMutation.mutate(payload as { id: number } & BillRequest, {
                    onSuccess: () => {
                      setShowForm(false);
                      setEditingBill(null);
                      resetForm();
                    },
                  });
                } else {
                  createMutation.mutate(payload as BillRequest, {
                    onSuccess: () => {
                      setShowForm(false);
                      resetForm();
                    },
                  });
                }
              }}
              editingId={editingBill?.id ?? null}
            />
          </div>
        </div>
      )}

      {/* Bill List */}
      {filteredAndSortedBills.length === 0 ? (
        <div className="placeholder-card">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="heading-3 mb-2">No bills yet</h3>
          <p className="text-muted text-base mb-6">
            Start by adding your first bill to track your recurring expenses.
          </p>
          <button
            onClick={() => {
              setEditingBill(null);
              resetForm();
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Your First Bill
          </button>
        </div>
      ) : (
        <BillList
          bills={filteredAndSortedBills as Bill[]}
          currency={currency}
          onEdit={handleEdit}
          onDelete={(id) => handleDelete(id)}
          deletingId={deleteMutation.isPending ? -1 : null}
        />
      )}
    </div>
  );
};

export default Bills;
