package com.heithered.loans.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum RepaymentFrequency {
    MONTHLY,
    QUARTERLY,
    ANNUALLY,
    ONE_TIME;

    @JsonCreator
    public static Currency fromString(String key) {
        return key == null ? null : Currency.valueOf(key.toUpperCase());
    }
}
