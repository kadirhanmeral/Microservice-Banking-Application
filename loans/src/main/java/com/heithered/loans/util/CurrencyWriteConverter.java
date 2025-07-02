package com.heithered.loans.util;

import com.heithered.loans.entity.Currency;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;


@WritingConverter
public class CurrencyWriteConverter implements Converter<Currency, String> {

    @Override
    public String convert(Currency source) {
        return source.name();
    }
}
