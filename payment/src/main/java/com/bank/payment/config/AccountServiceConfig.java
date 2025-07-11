package com.bank.payment.config;

import com.bank.payment.service.AccountServiceClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AccountServiceConfig {

    @Bean
    @Primary
    @ConditionalOnProperty(name = "account.service.mock.enabled", havingValue = "true", matchIfMissing = true)
    public AccountServiceClient mockAccountServiceClient() {
        return new AccountServiceClient() {
            @Override
            public boolean validateAccount(String accountId) {
                // Mock implementation - always return true for testing
                return true;
            }

            @Override
            public boolean processTransfer(String senderAccountId, String receiverAccountId, String amount, String currency) {
                // Mock implementation - farklı durumlar için test
                // FAILED durumu için özel hesap ID'leri
                if (senderAccountId.contains("FAIL") || receiverAccountId.contains("FAIL")) {
                    return false; // FAILED durumu
                }
                // PROCESSING durumu için özel hesap ID'leri (simülasyon)
                if (senderAccountId.contains("PROC") || receiverAccountId.contains("PROC")) {
                    // Simüle edilmiş işlem süresi
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    return true; // Sonunda başarılı
                }
                // Normal durum - başarılı
                return true;
            }
        };
    }
} 