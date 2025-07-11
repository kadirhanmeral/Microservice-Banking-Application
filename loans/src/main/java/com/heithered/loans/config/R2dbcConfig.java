package com.heithered.loans.config;


import com.heithered.loans.util.*;
import io.r2dbc.spi.ConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.convert.CustomConversions;
import org.springframework.data.r2dbc.config.AbstractR2dbcConfiguration;
import org.springframework.data.r2dbc.convert.R2dbcCustomConversions;

import java.util.Arrays;
import java.util.List;

@Configuration
public class R2dbcConfig extends AbstractR2dbcConfiguration {

    private final ConnectionFactory connectionFactory;

    public R2dbcConfig(ConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public ConnectionFactory connectionFactory() {
        return connectionFactory;
    }

    @Bean
    public R2dbcCustomConversions r2dbcCustomConversions() {
        List<Object> converters = Arrays.asList(
                new UUIDToByteArrayConverter(),
                new LongToUUIDConverter(),
                new HeapByteBufferToUUIDConverter(),
                new LoanTypeReadConverter(),
                new LoanTypeWriteConverter(),
                new LoanStatusReadConverter(),
                new LoanStatusWriteConverter(),
                new RepaymentFrequencyReadConverter(),
                new RepaymentFrequencyWriteConverter(),
                new BigDecimalReadConverter(),
                new BigDecimalWriteConverter(),
                new CurrencyReadConverter(),
                new CurrencyWriteConverter()
        );

        return new R2dbcCustomConversions(CustomConversions.StoreConversions.NONE, converters);
    }
}
