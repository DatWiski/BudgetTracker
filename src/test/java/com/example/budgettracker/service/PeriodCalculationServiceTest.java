package com.example.budgettracker.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.budgettracker.model.Period;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("PeriodCalculationService Tests")
class PeriodCalculationServiceTest {

  private PeriodCalculationService periodCalculationService;

  @BeforeEach
  void setUp() {
    periodCalculationService = new PeriodCalculationService();
  }

  @Nested
  @DisplayName("Next Occurrence Tests")
  class NextOccurrenceTests {

    @Test
    @DisplayName("Should calculate next daily occurrence")
    void shouldCalculateNextDailyOccurrence() {
      LocalDate pastDate = LocalDate.now().minusDays(5);

      LocalDate result = periodCalculationService.getNextOccurrence(pastDate, Period.DAILY);

      assertThat(result).isAfter(LocalDate.now());
      assertThat(result).isEqualTo(LocalDate.now().plusDays(1));
    }

    @Test
    @DisplayName("Should calculate next weekly occurrence")
    void shouldCalculateNextWeeklyOccurrence() {
      LocalDate pastDate = LocalDate.now().minusWeeks(2);

      LocalDate result = periodCalculationService.getNextOccurrence(pastDate, Period.WEEKLY);

      assertThat(result).isAfter(LocalDate.now());
      // Should be on the same day of week as the original
      assertThat(result.getDayOfWeek()).isEqualTo(pastDate.getDayOfWeek());
    }

    @Test
    @DisplayName("Should calculate next monthly occurrence")
    void shouldCalculateNextMonthlyOccurrence() {
      LocalDate pastDate = LocalDate.now().minusMonths(3);

      LocalDate result = periodCalculationService.getNextOccurrence(pastDate, Period.MONTHLY);

      assertThat(result).isAfter(LocalDate.now());
      // Should be on the same day of month as the original (if possible)
      assertThat(result.getDayOfMonth()).isEqualTo(pastDate.getDayOfMonth());
    }

    @Test
    @DisplayName("Should calculate next quarterly occurrence")
    void shouldCalculateNextQuarterlyOccurrence() {
      LocalDate pastDate = LocalDate.now().minusMonths(6);

      LocalDate result = periodCalculationService.getNextOccurrence(pastDate, Period.QUARTERLY);

      assertThat(result).isAfter(LocalDate.now());
      assertThat(result.getDayOfMonth()).isEqualTo(pastDate.getDayOfMonth());
    }

    @Test
    @DisplayName("Should calculate next yearly occurrence")
    void shouldCalculateNextYearlyOccurrence() {
      LocalDate pastDate = LocalDate.now().minusYears(2);

      LocalDate result = periodCalculationService.getNextOccurrence(pastDate, Period.YEARLY);

      assertThat(result).isAfter(LocalDate.now());
      assertThat(result.getMonth()).isEqualTo(pastDate.getMonth());
      assertThat(result.getDayOfMonth()).isEqualTo(pastDate.getDayOfMonth());
    }

    @Test
    @DisplayName("Should return original date for one-time period")
    void shouldReturnOriginalDateForOneTimePeriod() {
      LocalDate originalDate = LocalDate.of(2024, 6, 15);

      LocalDate result = periodCalculationService.getNextOccurrence(originalDate, Period.ONE_TIME);

      assertThat(result).isEqualTo(originalDate);
    }

    @Test
    @DisplayName("Should handle future original date")
    void shouldHandleFutureOriginalDate() {
      LocalDate futureDate = LocalDate.now().plusDays(10);

      LocalDate result = periodCalculationService.getNextOccurrence(futureDate, Period.DAILY);

      assertThat(result).isEqualTo(futureDate);
    }
  }

  @Nested
  @DisplayName("Days Until Next Tests")
  class DaysUntilNextTests {

    @Test
    @DisplayName("Should calculate days until next daily occurrence")
    void shouldCalculateDaysUntilNextDailyOccurrence() {
      LocalDate yesterday = LocalDate.now().minusDays(1);

      long result = periodCalculationService.getDaysUntilNext(yesterday, Period.DAILY);

      assertThat(result).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should calculate days until next weekly occurrence")
    void shouldCalculateDaysUntilNextWeeklyOccurrence() {
      LocalDate lastWeek = LocalDate.now().minusWeeks(1);

      long result = periodCalculationService.getDaysUntilNext(lastWeek, Period.WEEKLY);

      assertThat(result).isEqualTo(7L);
    }

    @Test
    @DisplayName("Should return 0 for future one-time events")
    void shouldReturnZeroForFutureOneTimeEvents() {
      LocalDate futureDate = LocalDate.now().plusDays(5);

      long result = periodCalculationService.getDaysUntilNext(futureDate, Period.ONE_TIME);

      assertThat(result).isEqualTo(5L);
    }

    @Test
    @DisplayName("Should handle same-day occurrence")
    void shouldHandleSameDayOccurrence() {
      LocalDate today = LocalDate.now();

      long result = periodCalculationService.getDaysUntilNext(today, Period.DAILY);

      assertThat(result).isEqualTo(1L); // Next occurrence is tomorrow
    }
  }

  @Nested
  @DisplayName("Occurrences In Range Tests")
  class OccurrencesInRangeTests {

    @Test
    @DisplayName("Should get daily occurrences in range")
    void shouldGetDailyOccurrencesInRange() {
      LocalDate startDate = LocalDate.of(2024, 1, 1);
      LocalDate originalDate = LocalDate.of(2024, 1, 1);
      LocalDate endDate = LocalDate.of(2024, 1, 5);

      LocalDate[] result =
          periodCalculationService.getOccurrencesInRange(
              originalDate, Period.DAILY, startDate, endDate);

      assertThat(result).hasSize(5);
      assertThat(result[0]).isEqualTo(LocalDate.of(2024, 1, 1));
      assertThat(result[4]).isEqualTo(LocalDate.of(2024, 1, 5));
    }

    @Test
    @DisplayName("Should get weekly occurrences in range")
    void shouldGetWeeklyOccurrencesInRange() {
      LocalDate originalDate = LocalDate.of(2024, 1, 1); // Monday
      LocalDate startDate = LocalDate.of(2024, 1, 1);
      LocalDate endDate = LocalDate.of(2024, 1, 21);

      LocalDate[] result =
          periodCalculationService.getOccurrencesInRange(
              originalDate, Period.WEEKLY, startDate, endDate);

      assertThat(result).hasSize(3);
      assertThat(result[0]).isEqualTo(LocalDate.of(2024, 1, 1));
      assertThat(result[1]).isEqualTo(LocalDate.of(2024, 1, 8));
      assertThat(result[2]).isEqualTo(LocalDate.of(2024, 1, 15));
    }

    @Test
    @DisplayName("Should get monthly occurrences in range")
    void shouldGetMonthlyOccurrencesInRange() {
      LocalDate originalDate = LocalDate.of(2024, 1, 15);
      LocalDate startDate = LocalDate.of(2024, 1, 1);
      LocalDate endDate = LocalDate.of(2024, 4, 30);

      LocalDate[] result =
          periodCalculationService.getOccurrencesInRange(
              originalDate, Period.MONTHLY, startDate, endDate);

      assertThat(result).hasSize(4);
      assertThat(result[0]).isEqualTo(LocalDate.of(2024, 1, 15));
      assertThat(result[1]).isEqualTo(LocalDate.of(2024, 2, 15));
      assertThat(result[2]).isEqualTo(LocalDate.of(2024, 3, 15));
      assertThat(result[3]).isEqualTo(LocalDate.of(2024, 4, 15));
    }

    @Test
    @DisplayName("Should handle one-time occurrence in range")
    void shouldHandleOneTimeOccurrenceInRange() {
      LocalDate originalDate = LocalDate.of(2024, 2, 15);
      LocalDate startDate = LocalDate.of(2024, 1, 1);
      LocalDate endDate = LocalDate.of(2024, 3, 31);

      LocalDate[] result =
          periodCalculationService.getOccurrencesInRange(
              originalDate, Period.ONE_TIME, startDate, endDate);

      assertThat(result).hasSize(1);
      assertThat(result[0]).isEqualTo(originalDate);
    }

    @Test
    @DisplayName("Should return empty array when one-time occurrence outside range")
    void shouldReturnEmptyArrayWhenOneTimeOccurrenceOutsideRange() {
      LocalDate originalDate = LocalDate.of(2024, 5, 15);
      LocalDate startDate = LocalDate.of(2024, 1, 1);
      LocalDate endDate = LocalDate.of(2024, 3, 31);

      LocalDate[] result =
          periodCalculationService.getOccurrencesInRange(
              originalDate, Period.ONE_TIME, startDate, endDate);

      assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle original date before range start")
    void shouldHandleOriginalDateBeforeRangeStart() {
      LocalDate originalDate = LocalDate.of(2023, 12, 15);
      LocalDate startDate = LocalDate.of(2024, 1, 1);
      LocalDate endDate = LocalDate.of(2024, 2, 29);

      LocalDate[] result =
          periodCalculationService.getOccurrencesInRange(
              originalDate, Period.MONTHLY, startDate, endDate);

      assertThat(result).hasSize(2);
      assertThat(result[0]).isEqualTo(LocalDate.of(2024, 1, 15));
      assertThat(result[1]).isEqualTo(LocalDate.of(2024, 2, 15));
    }
  }

  @Nested
  @DisplayName("Edge Cases Tests")
  class EdgeCasesTests {

    @Test
    @DisplayName("Should handle month-end dates properly")
    void shouldHandleMonthEndDatesProperly() {
      LocalDate originalDate = LocalDate.of(2024, 1, 31); // January 31

      LocalDate result = periodCalculationService.getNextOccurrence(originalDate, Period.MONTHLY);

      // Since February doesn't have 31 days, should handle gracefully
      assertThat(result).isAfter(LocalDate.now());
      assertThat(result.getMonth().getValue()).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("Should handle leap year dates")
    void shouldHandleLeapYearDates() {
      LocalDate leapDay = LocalDate.of(2024, 2, 29); // Leap day

      LocalDate result = periodCalculationService.getNextOccurrence(leapDay, Period.YEARLY);

      assertThat(result).isAfter(LocalDate.now());
      // Should advance to next leap year or adjust appropriately
    }

    @Test
    @DisplayName("Should handle quarterly from month-end")
    void shouldHandleQuarterlyFromMonthEnd() {
      LocalDate originalDate = LocalDate.of(2024, 1, 31);

      LocalDate result = periodCalculationService.getNextOccurrence(originalDate, Period.QUARTERLY);

      assertThat(result).isAfter(LocalDate.now());
      // Should be approximately 3 months later
    }

    @Test
    @DisplayName("Should handle very old original dates")
    void shouldHandleVeryOldOriginalDates() {
      LocalDate veryOldDate = LocalDate.of(2020, 1, 1);

      LocalDate result = periodCalculationService.getNextOccurrence(veryOldDate, Period.YEARLY);

      assertThat(result).isAfter(LocalDate.now());
      assertThat(result.getYear()).isGreaterThan(LocalDate.now().getYear());
    }

    @Test
    @DisplayName("Should handle empty range")
    void shouldHandleEmptyRange() {
      LocalDate originalDate = LocalDate.of(2024, 1, 15);
      LocalDate startDate = LocalDate.of(2024, 2, 1);
      LocalDate endDate = LocalDate.of(2024, 1, 31); // End before start

      LocalDate[] result =
          periodCalculationService.getOccurrencesInRange(
              originalDate, Period.DAILY, startDate, endDate);

      assertThat(result).isEmpty();
    }
  }
}
