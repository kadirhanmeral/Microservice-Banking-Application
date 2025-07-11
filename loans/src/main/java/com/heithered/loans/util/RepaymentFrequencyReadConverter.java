package com.heithered.loans.util;

import com.heithered.loans.entity.LoanType;
import com.heithered.loans.entity.RepaymentFrequency;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

@ReadingConverter
public class RepaymentFrequencyReadConverter implements Converter<String, RepaymentFrequency> {
    @Override
    public RepaymentFrequency convert(String source) {
        return RepaymentFrequency.valueOf(source);
    }
}