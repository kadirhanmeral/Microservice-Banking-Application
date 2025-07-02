package com.heithered.loans.exception;

public class InvalidInterestRateException extends RuntimeException {
    public InvalidInterestRateException(String message) {
        super(message);
    }
}
