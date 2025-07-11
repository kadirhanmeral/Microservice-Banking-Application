package com.heithered.loans.exception;

public class InvalidMonthlyIncomeException extends RuntimeException {
    public InvalidMonthlyIncomeException(String message) {
        super(message);
    }
}
