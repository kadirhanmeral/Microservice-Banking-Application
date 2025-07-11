package com.bank.payment.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "account-service", url = "${account.service.url}")
@ConditionalOnProperty(name = "account.service.mock.enabled", havingValue = "false")
public interface AccountServiceClient {

    @GetMapping("/api/v1/accounts/validate")
    boolean validateAccount(@RequestParam("accountId") String accountId);

    @PostMapping("/api/v1/accounts/transfer")
    boolean processTransfer(
            @RequestParam("senderAccountId") String senderAccountId,
            @RequestParam("receiverAccountId") String receiverAccountId,
            @RequestParam("amount") String amount,
            @RequestParam("currency") String currency);
}