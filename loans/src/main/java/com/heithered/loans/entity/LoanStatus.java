package com.heithered.loans.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum LoanStatus {
    PENDING,
    ACTIVE,
    PAID,
    DEFAULTED,
    CLOSED,
    CANCELLED;

    @JsonCreator
    public static Currency fromString(String key) {
        return key == null ? null : Currency.valueOf(key.toUpperCase());
    }
}
