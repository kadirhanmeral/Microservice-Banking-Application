package com.heithered.loans.dto;

import com.heithered.loans.entity.LoanStatus;

public record UpdateLoanStatusRequestDto(
        LoanStatus loanStatus
) {
}
