package com.heithered.loans.dto;

import com.heithered.loans.entity.Currency;

import java.math.BigDecimal;
import java.util.UUID;

public record LoanEligibilityRequestDto(
        UUID customerId,
        BigDecimal monthlyIncome,
        Currency incomeCurrency,
        BigDecimal loanAmount,
        Currency loanCurrency,
        Integer termInMonths,
        BigDecimal interestRate) {
}
