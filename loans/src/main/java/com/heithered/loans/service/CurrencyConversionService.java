package com.heithered.loans.service;

import com.heithered.loans.entity.Currency;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Service
public class CurrencyConversionService {

    // Hardcoded example rates to USD
    private static final Map<Currency, BigDecimal> TO_USD_RATES = Map.of(
            Currency.USD, BigDecimal.ONE,
            Currency.EUR, BigDecimal.valueOf(1.1),   // 1 EUR = 1.1 USD
            Currency.TRY, BigDecimal.valueOf(0.036), // 1 TRY = 0.036 USD
            Currency.GBP, BigDecimal.valueOf(1.25)   // 1 GBP = 1.25 USD
    );

    /**
     * Converts the amount from sourceCurrency to targetCurrency.
     * If either currency is null or not supported, returns BigDecimal.ZERO.
     */
    public BigDecimal convert(BigDecimal amount, Currency sourceCurrency, Currency targetCurrency) {
        if (amount == null || sourceCurrency == null || targetCurrency == null) {
            return BigDecimal.ZERO;
        }

        if (sourceCurrency == targetCurrency) {
            return amount;
        }

        BigDecimal sourceToUsdRate = TO_USD_RATES.get(sourceCurrency);
        BigDecimal targetToUsdRate = TO_USD_RATES.get(targetCurrency);

        if (sourceToUsdRate == null || targetToUsdRate == null || targetToUsdRate.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        // Convert source amount to USD
        BigDecimal amountInUsd = amount.multiply(sourceToUsdRate);

        // Convert USD amount to target currency
        return amountInUsd.divide(targetToUsdRate, 6, RoundingMode.HALF_UP);
    }
}
