export interface Subscription {
  id: number;
  name: string;
  price: number;
  billingPeriod: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  nextBillingDate: string;
  active: boolean;
  categoryId: number;
  categoryName?: string;
  categoryColor?: string;
}

export interface SubscriptionRequest {
  name: string;
  price: number;
  billingPeriod: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  nextBillingDate: string;
  categoryId?: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  locked: boolean;
  subscriptionCount?: number;
}

export interface CategoryRequest {
  name: string;
  color: string;
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
  message: string;
  timestamp: string;
  path: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  timestamp: string;
  path: string;
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