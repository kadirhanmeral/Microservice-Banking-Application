package com.heithered.loans.util;

import com.heithered.loans.entity.LoanType;
import com.heithered.loans.entity.RepaymentFrequency;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

@WritingConverter
public class RepaymentFrequencyWriteConverter implements Converter<RepaymentFrequency, String> {
    @Override
    public String convert(RepaymentFrequency source) {
        return source.name();
    }
}