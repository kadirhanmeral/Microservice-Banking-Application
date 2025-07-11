package com.heithered.loans.util;

import com.heithered.loans.entity.Currency;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

@ReadingConverter
public class CurrencyReadConverter implements Converter<String, Currency> {

    @Override
    public Currency convert(String source) {
        return Currency.valueOf(source);
    }
}
