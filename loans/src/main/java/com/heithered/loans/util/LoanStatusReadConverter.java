package com.heithered.loans.util;

import com.heithered.loans.entity.LoanStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

@ReadingConverter
public class LoanStatusReadConverter implements Converter<String, LoanStatus> {
    @Override
    public LoanStatus convert(String source) {
        return LoanStatus.valueOf(source);
    }
}