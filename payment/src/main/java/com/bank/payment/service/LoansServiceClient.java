package com.bank.payment.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "loans", url = "${loans.service.url:http://localhost:8083}")
public interface LoansServiceClient {

    @GetMapping("/loans/customer/{customerId}")
    Object getLoansByCustomerId(@PathVariable UUID customerId);

    @GetMapping("/loans/{loanId}")
    Object getLoanById(@PathVariable UUID loanId);
} 