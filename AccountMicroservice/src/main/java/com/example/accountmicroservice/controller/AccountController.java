package com.example.accountmicroservice.controller;

import com.example.accountmicroservice.dto.BalanceRequest;
import com.example.accountmicroservice.entity.BankAccount;
import com.example.accountmicroservice.entity.Transaction;
import com.example.accountmicroservice.service.AccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private static final Logger log = LoggerFactory.getLogger(AccountController.class);
    private final AccountService service;

    public AccountController(AccountService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<BankAccount> getById(@PathVariable Long id) {
        log.debug("Getting account by ID: {}", id);
        return ResponseEntity.ok(service.getAccountById(id));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@PathVariable Long id) {
        log.debug("Getting transactions for account ID: {}", id);
        return ResponseEntity.ok(service.getTransactions(id));
    }

    @PatchMapping("/{id}/balance")
    public ResponseEntity<BankAccount> updateBalance(
            @PathVariable Long id,
            @RequestBody BalanceRequest request) {
        log.info("Updating balance for account ID: {} with amount: {}", id, request.getAmount());
        return ResponseEntity.ok(service.updateBalance(id, request.getAmount()));
    }

    @PostMapping("/create")
    public ResponseEntity<BankAccount> create(@RequestBody BankAccount acc) {
        log.info("Creating new account for user: {}", acc.getUserId());
        return ResponseEntity.ok(service.createAccount(acc));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BankAccount>> byUser(@PathVariable String userId) {
        log.debug("Getting accounts for user: {}", userId);
        return ResponseEntity.ok(service.getAccountsByUser(userId));
    }

    @PostMapping("/from/{fromId}/to/{toId}")
    public ResponseEntity<String> transfer(
            @PathVariable Long fromId,
            @PathVariable Long toId,
            @RequestBody BalanceRequest request) {
        log.info("Transferring amount {} from account {} to account {}", request.getAmount(), fromId, toId);
        service.transfer(fromId, toId, request.getAmount());
        return ResponseEntity.ok("Transfer successful");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting account with ID: {}", id);
        service.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<BankAccount> getByAccountNumber(@PathVariable String accountNumber) {
        log.debug("Getting account by account number: {}", accountNumber);
        return ResponseEntity.ok(service.getAccountByAccountNumber(accountNumber));
    }
}
