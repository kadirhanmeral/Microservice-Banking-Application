package com.heithered.loans.util;

import com.heithered.loans.entity.LoanType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

@ReadingConverter
public class LoanTypeReadConverter implements Converter<String, LoanType> {
    @Override
    public LoanType convert(String source) {
        return LoanType.valueOf(source);
    }
}