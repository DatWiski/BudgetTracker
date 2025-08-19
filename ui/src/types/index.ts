export type Period = 'ONE_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Subscription {
  id: number;
  name: string;
  price: number;
  period: Period;
  nextBillingDate: string;
  active: boolean;
  categoryId: number;
  categoryName?: string;
}

export interface SubscriptionRequest {
  name: string;
  price: number;
  period: Period;
  nextBillingDate: string;
  categoryId?: number;
  active?: boolean;
}

export interface Category {
  id: number;
  name: string;
  locked: boolean;
  subscriptionCount?: number;
}

export interface CategoryRequest {
  name: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

export interface AuthStatus {
  authenticated: boolean;
  username?: string;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

export interface ValidationErrorResponse {
  status: number;
  error: string;
  fieldErrors: Record<string, string>;
  timestamp: string;
}

export interface SubscriptionMetrics {
  totalMonthlySpend: number;
  activeSubscriptions: number;
  upcomingBills: number;
  nextBillDate?: string;
  nextBillAmount?: number;
}

export interface RecentActivity extends Subscription {
  lastBillingDate: Date;
  daysSinceLastBilling: number;
}

export interface UserCurrencyResponse {
  currency: 'USD' | 'EUR';
}

export interface Income {
  id: number;
  name: string;
  amount: number;
  incomeDate: string;
  period: Period;
  description?: string;
  categoryId?: number;
  categoryName?: string;
}

export interface IncomeRequest {
  name: string;
  amount: number;
  incomeDate: string;
  period: Period;
  description?: string;
  categoryId?: number;
}