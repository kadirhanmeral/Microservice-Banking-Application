package com.heithered.loans.util;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class LongToUUIDConverter implements Converter<Long, UUID> {
    @Override
    public UUID convert(Long source) {
        // Split the long into two parts: high and low
        long high = source; // This would be the high 64 bits
        long low = 0L;      // Set low part to zero, or use a method to populate it based on your need

        return new UUID(high, low);
    }
}
