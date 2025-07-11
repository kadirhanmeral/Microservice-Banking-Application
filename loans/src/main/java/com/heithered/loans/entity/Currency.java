package com.heithered.loans.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Currency {
    USD,
    EUR,
    TRY,
    GBP;

    @JsonCreator
    public static Currency fromString(String key) {
        return key == null ? null : Currency.valueOf(key.toUpperCase());
    }
}
