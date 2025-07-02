package com.heithered.loans.util;

import com.heithered.loans.entity.LoanType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

@WritingConverter
public class LoanTypeWriteConverter implements Converter<LoanType, String> {
    @Override
    public String convert(LoanType source) {
        return source.name();
    }
}