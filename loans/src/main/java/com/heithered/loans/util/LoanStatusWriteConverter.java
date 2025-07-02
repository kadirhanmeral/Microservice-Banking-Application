package com.heithered.loans.util;

import com.heithered.loans.entity.LoanStatus;
import com.heithered.loans.entity.LoanType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

@WritingConverter
public class LoanStatusWriteConverter implements Converter<LoanStatus, String> {
    @Override
    public String convert(LoanStatus source) {
        return source.name();
    }
}