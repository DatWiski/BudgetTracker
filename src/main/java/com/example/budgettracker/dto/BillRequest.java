package com.example.budgettracker.dto;

import com.example.budgettracker.model.Period;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
@Schema(description = "Request payload for creating or updating a bill")
public class BillRequest {

  @NotBlank(message = "Bill name is required")
  @Size(min = 1, max = 100, message = "Bill name must be between 1 and 100 characters")
  @Schema(description = "Name of the bill", example = "Rent Payment")
  private String name;

  @NotNull(message = "Amount is required")
  @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
  @DecimalMax(value = "99999999.99", message = "Amount cannot exceed 99,999,999.99")
  @Digits(
      integer = 8,
      fraction = 2,
      message = "Amount must have at most 8 digits before decimal and 2 after")
  @Schema(description = "Amount of the bill", example = "1200.00")
  private BigDecimal amount;

  @NotNull(message = "Period is required")
  @Schema(description = "Bill frequency", example = "MONTHLY")
  private Period period;

  @NotNull(message = "Due date is required")
  @Schema(description = "Bill due date", example = "2024-02-01")
  private LocalDate dueDate;

  @Schema(description = "Category ID (optional)", example = "1")
  private Long categoryId;

  @Schema(description = "Whether the bill is active", example = "true")
  private boolean active = true;
}
