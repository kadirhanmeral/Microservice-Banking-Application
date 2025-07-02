package com.heithered.loans.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum LoanType {
    PERSONAL,
    MORTGAGE,
    AUTO,
    STUDENT,
    BUSINESS,
    HOME_IMPROVEMENT;

    @JsonCreator
    public static Currency fromString(String key) {
        return key == null ? null : Currency.valueOf(key.toUpperCase());
    }
}
