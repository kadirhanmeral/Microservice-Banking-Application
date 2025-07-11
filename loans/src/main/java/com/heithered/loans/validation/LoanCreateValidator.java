package com.heithered.loans.validation;

import com.heithered.loans.dto.LoanRequestDto;
import com.heithered.loans.exception.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class LoanCreateValidator {

    public void validate(LoanRequestDto request) {
        if (request.loanAmount() == null || request.loanAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidLoanAmountException("Loan amount must be greater than zero");
        }
        if (request.termInMonths() == null || request.termInMonths() <= 0) {
            throw new InvalidTermException("Loan term must be greater than zero");
        }
        if (request.interestRate() == null || request.interestRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidInterestRateException("Interest rate must be non-negative");
        }
        if (request.loanType() == null) {
            throw new InvalidLoanTypeException("Loan type must be provided");
        }
        if (request.currency() == null) {
            throw new InvalidCurrencyException("Currency must be provided");
        }
    }
}
