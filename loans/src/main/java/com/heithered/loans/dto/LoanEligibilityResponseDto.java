package com.heithered.loans.dto;

public record LoanEligibilityResponseDto(
        boolean eligible,
        String reason) {
}
