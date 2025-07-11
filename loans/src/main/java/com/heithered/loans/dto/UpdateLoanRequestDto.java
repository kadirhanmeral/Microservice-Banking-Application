package com.heithered.loans.dto;

import com.heithered.loans.entity.LoanStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateLoanRequestDto(
        BigDecimal loanAmount,
        Integer termInMonths,
        BigDecimal interestRate,
        LocalDate endDate
) {}
