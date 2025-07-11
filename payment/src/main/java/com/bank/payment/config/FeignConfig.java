package com.bank.payment.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "account.service.mock.enabled", havingValue = "false")
@EnableFeignClients(basePackages = "com.bank.payment.service")
public class FeignConfig {
    // This configuration will only be active when mock is disabled
} 