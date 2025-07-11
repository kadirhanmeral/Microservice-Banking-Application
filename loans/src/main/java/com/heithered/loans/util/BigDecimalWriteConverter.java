package com.heithered.loans.util;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

import java.math.BigDecimal;

@WritingConverter
public class BigDecimalWriteConverter implements Converter<BigDecimal, Object> {
    @Override
    public Object convert(BigDecimal source) {
        return source;
    }
}