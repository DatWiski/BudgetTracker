import { useMemo } from 'react';
import type { Subscription, SubscriptionMetrics, RecentActivity } from '../types';
import { convertToMonthly } from '../utils/currency';
import { calculatePreviousBillingDate, daysBetweenDates, daysUntilBilling } from '../utils/dateCalculations';

export const useSubscriptionMetrics = (subscriptions: Subscription[] = []): {
  metrics: SubscriptionMetrics;
  upcomingBills: Subscription[];
  recentActivity: RecentActivity[];
} => {
  const metrics = useMemo((): SubscriptionMetrics => {
    const activeSubscriptions = subscriptions.filter(sub => sub.active);
    const totalMonthlySpend = activeSubscriptions.reduce((total, sub) => {
      return total + convertToMonthly(sub.price, sub.period);
    }, 0);

    const upcomingBills = activeSubscriptions.filter(sub => {
      const days = daysUntilBilling(sub.nextBillingDate);
      return days >= 0 && days <= 7;
    });

    const nextBill = upcomingBills.sort((a, b) => 
      new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
    )[0];

    return {
      totalMonthlySpend,
      activeSubscriptions: activeSubscriptions.length,
      upcomingBills: upcomingBills.length,
      nextBillDate: nextBill?.nextBillingDate,
      nextBillAmount: nextBill?.price
    };
  }, [subscriptions]);

  const upcomingBills = useMemo(() => {
    return subscriptions
      .filter(sub => sub.active)
      .filter(sub => {
        const days = daysUntilBilling(sub.nextBillingDate);
        return days >= 0 && days <= 7;
      })
      .sort((a, b) => 
        new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
      );
  }, [subscriptions]);

  const recentActivity = useMemo((): RecentActivity[] => {
    return subscriptions
      .filter(sub => sub.active)
      .map(sub => {
        const lastBilling = calculatePreviousBillingDate(sub.nextBillingDate, sub.period);
        const daysSinceLastBilling = daysBetweenDates(lastBilling, new Date());

        return {
          ...sub,
          lastBillingDate: lastBilling,
          daysSinceLastBilling
        };
      })
      .filter(sub => sub.daysSinceLastBilling <= 30 && sub.daysSinceLastBilling >= 0)
      .sort((a, b) => a.daysSinceLastBilling - b.daysSinceLastBilling)
      .slice(0, 5);
  }, [subscriptions]);

  return { metrics, upcomingBills, recentActivity };
};