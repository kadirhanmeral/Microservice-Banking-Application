package com.heithered.loans.util;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.math.BigDecimal;

@ReadingConverter
public class BigDecimalReadConverter implements Converter<Object, BigDecimal> {
    @Override
    public BigDecimal convert(Object source) {
        if (source instanceof BigDecimal) {
            return (BigDecimal) source;
        }
        if (source instanceof Number) {
            return BigDecimal.valueOf(((Number) source).doubleValue());
        }
        if (source instanceof String) {
            return new BigDecimal((String) source);
        }
        throw new IllegalArgumentException("Cannot convert " + source + " to BigDecimal");
    }
}
