package com.heithered.loans.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LoanRequestDto(
        UUID customerId,
        String loanType,
        BigDecimal loanAmount,
        String currency,
        Integer termInMonths,
        BigDecimal interestRate,
        String repaymentFrequency,
        LocalDate startDate,
        LocalDate endDate,
        UUID coSignerId,
        String collateral
) {}