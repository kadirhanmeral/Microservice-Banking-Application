package com.heithered.loans.exception;

public class InvalidRepaymentFrequencyException extends RuntimeException {
    public InvalidRepaymentFrequencyException(String message) {
        super(message);
    }
}
