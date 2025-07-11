package com.heithered.loans.validation;

import com.heithered.loans.dto.LoanEligibilityRequestDto;
import com.heithered.loans.exception.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class LoanEligibilityValidator {

    public void validate(LoanEligibilityRequestDto request) {
        if (request.customerId() == null) {
            throw new InvalidCustomerIdException("Customer ID must be provided");
        }
        if (request.monthlyIncome() == null || request.monthlyIncome().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidMonthlyIncomeException("Monthly income must be greater than zero");
        }
        if (request.incomeCurrency() == null) {
            throw new InvalidCurrencyException("Income currency must be provided");
        }
        if (request.loanAmount() == null || request.loanAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidLoanAmountException("Loan amount must be greater than zero");
        }
        if (request.loanCurrency() == null) {
            throw new InvalidCurrencyException("Loan currency must be provided");
        }
        if (request.termInMonths() == null || request.termInMonths() <= 0) {
            throw new InvalidTermException("Loan term must be greater than zero");
        }
        if (request.interestRate() == null || request.interestRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidInterestRateException("Interest rate must be non-negative");
        }
    }
}
