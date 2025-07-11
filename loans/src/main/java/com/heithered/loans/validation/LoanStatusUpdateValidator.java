package com.heithered.loans.validation;

import com.heithered.loans.dto.UpdateLoanStatusRequestDto;
import com.heithered.loans.exception.InvalidLoanStatusException;
import org.springframework.stereotype.Component;

@Component
public class LoanStatusUpdateValidator {
    public void validate(UpdateLoanStatusRequestDto request) {
        if (request.loanStatus() == null) {
            throw new InvalidLoanStatusException("Loan status must be provided");
        }
    }
}
