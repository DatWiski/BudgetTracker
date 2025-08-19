package com.example.budgettracker.service;

import com.example.budgettracker.model.Period;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Service for calculating recurring dates based on billing periods.
 * Handles all period-based date calculations for subscriptions, bills, and income.
 */
@Service
public class PeriodCalculationService {

    /**
     * Calculates the next occurrence date from a given original date and period.
     * Always returns a future date (never past or today).
     * 
     * @param originalDate The original/initial date
     * @param period The recurrence period (DAILY, WEEKLY, MONTHLY, etc.)
     * @return The next future occurrence date
     */
    public LocalDate getNextOccurrence(LocalDate originalDate, Period period) {
        LocalDate today = LocalDate.now();
        
        // One-time events don't recur - return the original date
        if (period == Period.ONE_TIME) {
            return originalDate;
        }
        
        LocalDate nextDate = originalDate;

        // Keep advancing until we get a future date
        while (!nextDate.isAfter(today)) {
            nextDate = addPeriod(nextDate, period);
        }

        return nextDate;
    }

    /**
     * Adds one period to the given date.
     * Handles edge cases like month-end dates properly.
     * 
     * @param date The base date
     * @param period The period to add
     * @return The date after adding one period
     */
    private LocalDate addPeriod(LocalDate date, Period period) {
        switch (period) {
            case DAILY:
                return date.plusDays(1);
            
            case WEEKLY:
                return date.plusWeeks(1);
            
            case MONTHLY:
                return addMonth(date);
            
            case QUARTERLY:
                return addMonth(date.plusMonths(2)); // Add 3 months total
            
            case YEARLY:
                return date.plusYears(1);
            
            case ONE_TIME:
            default:
                // One-time periods don't recur
                return date;
        }
    }

    /**
     * Adds one month to a date, handling edge cases properly.
     * Examples:
     * - Jan 31 + 1 month = Feb 28/29 (last day of February)
     * - Jan 30 + 1 month = Feb 28/29 (if February is shorter)
     * - Jan 15 + 1 month = Feb 15 (same day of month)
     * 
     * @param date The original date
     * @return The date one month later
     */
    private LocalDate addMonth(LocalDate date) {
        try {
            // Try to add exactly one month (same day)
            return date.plusMonths(1);
        } catch (Exception e) {
            // Handle edge case: if day doesn't exist in target month
            // (e.g., Jan 31 -> Feb 31 doesn't exist)
            // Fall back to last day of the target month
            return date.plusMonths(1).withDayOfMonth(
                date.plusMonths(1).lengthOfMonth()
            );
        }
    }

    /**
     * Calculates how many days until the next occurrence.
     * Returns 0 if the next occurrence is today, positive for future dates.
     * 
     * @param originalDate The original date
     * @param period The recurrence period
     * @return Days until next occurrence (0 or positive)
     */
    public long getDaysUntilNext(LocalDate originalDate, Period period) {
        LocalDate nextDate = getNextOccurrence(originalDate, period);
        return ChronoUnit.DAYS.between(LocalDate.now(), nextDate);
    }

    /**
     * Gets all occurrences within a date range.
     * Useful for generating calendar views or spending projections.
     * 
     * @param originalDate The original date
     * @param period The recurrence period
     * @param startDate Range start (inclusive)
     * @param endDate Range end (inclusive)
     * @return Array of dates within the range
     */
    public LocalDate[] getOccurrencesInRange(LocalDate originalDate, Period period, 
                                           LocalDate startDate, LocalDate endDate) {
        if (period == Period.ONE_TIME) {
            // One-time events only occur once
            if (!originalDate.isBefore(startDate) && !originalDate.isAfter(endDate)) {
                return new LocalDate[]{originalDate};
            }
            return new LocalDate[0];
        }

        java.util.List<LocalDate> occurrences = new java.util.ArrayList<>();
        LocalDate current = originalDate;

        // Start from the first occurrence at or after startDate
        while (current.isBefore(startDate)) {
            current = addPeriod(current, period);
        }

        // Collect all occurrences within range
        while (!current.isAfter(endDate)) {
            occurrences.add(current);
            current = addPeriod(current, period);
        }

        return occurrences.toArray(new LocalDate[0]);
    }
}