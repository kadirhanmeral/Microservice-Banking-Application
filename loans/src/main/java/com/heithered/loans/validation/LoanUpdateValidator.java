package com.heithered.loans.validation;

import com.heithered.loans.dto.UpdateLoanRequestDto;
import com.heithered.loans.exception.InvalidInterestRateException;
import com.heithered.loans.exception.InvalidLoanAmountException;
import com.heithered.loans.exception.InvalidLoanStatusException;
import com.heithered.loans.exception.InvalidTermException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class LoanUpdateValidator {

    public void validate(UpdateLoanRequestDto request) {
        if (request.loanAmount() == null || request.loanAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidLoanAmountException("Loan amount must be greater than zero");
        }
        if (request.termInMonths() == null || request.termInMonths() <= 0) {
            throw new InvalidTermException("Loan term must be greater than zero");
        }
        if (request.interestRate() == null || request.interestRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidInterestRateException("Interest rate must be non-negative");
        }

        // Optionally: validate that the status is one of allowed values, if not done by enum automatically
    }
}
