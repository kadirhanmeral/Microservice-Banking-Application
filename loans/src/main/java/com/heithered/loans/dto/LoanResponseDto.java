package com.heithered.loans.dto;

import com.heithered.loans.entity.Currency;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LoanResponseDto(
        UUID loanId,
        UUID customerId,
        String loanType,
        BigDecimal loanAmount,
        Currency currency,
        Integer termInMonths,
        BigDecimal interestRate,
        String repaymentFrequency,
        String status,
        BigDecimal outstandingBalance,
        LocalDate startDate,
        LocalDate endDate
) {
}
