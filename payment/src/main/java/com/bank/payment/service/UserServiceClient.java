package com.bank.payment.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user.service.url:http://localhost:8082}")
public interface UserServiceClient {

    @GetMapping("/api/users/accounts/{accountId}")
    Object getUserByAccountId(@PathVariable String accountId);

    @GetMapping("/api/users/{userId}")
    Object getUserById(@PathVariable Long userId);
} 