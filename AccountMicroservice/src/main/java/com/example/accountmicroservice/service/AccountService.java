package com.example.accountmicroservice.service;

import com.example.accountmicroservice.entity.BankAccount;
import com.example.accountmicroservice.entity.Transaction;
import com.example.accountmicroservice.repository.BankAccountRepository;
import com.example.accountmicroservice.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final BankAccountRepository repo;
    private final TransactionRepository transactionRepo;
    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate;
    private final String notificationUrl = "http://notification-service:8085/api/notifications/send";

    public AccountService(BankAccountRepository repo, TransactionRepository transactionRepo, JdbcTemplate jdbcTemplate, RestTemplate restTemplate) {
        this.repo = repo;
        this.transactionRepo = transactionRepo;
        this.jdbcTemplate = jdbcTemplate;
        this.restTemplate = restTemplate;
    }

    public BankAccount createAccount(BankAccount acc) {
        if (acc.getBalance() == null) {
            acc.setBalance(0.0);
        }
        if (acc.getAccountNumber() == null || acc.getAccountNumber().isEmpty()) {
            acc.setAccountNumber(generateUniqueAccountNumber());
        }
        return repo.save(acc);
    }

    public List<BankAccount> getAccountsByUser(String userId) {
        return repo.findByUserId(userId);
    }

    public BankAccount getAccountById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found: " + id));
    }

    public BankAccount updateBalance(Long id, Double amount) {
        BankAccount account = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found: " + id));

        double newBalance = account.getBalance() + amount;
        if (newBalance < 0) {
            throw new RuntimeException("Insufficient balance: " + account.getBalance());
        }

        account.setBalance(newBalance);
        repo.save(account);

        Transaction tx = new Transaction();
        tx.setAccountId(account.getId());
        tx.setAmount(amount);
        tx.setType(amount > 0 ? "DEPOSIT" : "WITHDRAW");
        transactionRepo.save(tx);
        return account;
    }

    public void transfer(Long fromId, Long toId, Double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Transfer amount must be positive. Entered: " + amount);
        }

        BankAccount from = repo.findById(fromId)
                .orElseThrow(() -> new RuntimeException("Sender account not found: " + fromId));
        BankAccount to = repo.findById(toId)
                .orElseThrow(() -> new RuntimeException("Receiver account not found: " + toId));

        if (!from.getCurrency().equals(to.getCurrency())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Currency mismatch! Sender: " + from.getCurrency() + ", Receiver: " + to.getCurrency()
            );
        }

        if (from.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance: " + from.getBalance());
        }

        from.setBalance(from.getBalance() - amount);
        to.setBalance(to.getBalance() + amount);
        repo.save(from);
        repo.save(to);

        Transaction outTx = new Transaction();
        outTx.setAccountId(from.getId());
        outTx.setAmount(-amount);
        outTx.setType("TRANSFER_OUT");
        outTx.setTargetAccountId(to.getId());
        transactionRepo.save(outTx);

        Transaction inTx = new Transaction();
        inTx.setAccountId(to.getId());
        inTx.setAmount(amount);
        inTx.setType("TRANSFER_IN");
        inTx.setTargetAccountId(from.getId());
        transactionRepo.save(inTx);
    }

    public void deleteAccount(Long id) {
        repo.deleteById(id);
    }

    private String generateUniqueAccountNumber() {
        String accountNumber;
        do {
            accountNumber = "TR" + (long)(Math.random() * 1_000_000_000_000_000L);
        } while (repo.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    public List<Transaction> getTransactions(Long accountId) {
        return transactionRepo.findByAccountId(accountId);
    }

    private void sendNotification(String userId, Long accountId, Double amount) {
        String email = "user"+userId+"@mail.com";
        String message = "Transaction completed for your account ("+accountId+"): " + amount;

        Map<String, String> payload = new HashMap<>();
        payload.put("email", email);
        payload.put("message", message);

        ResponseEntity<String> response = restTemplate.postForEntity(
                notificationUrl,
                payload,
                String.class);

        log.info("Notification sent: {}", response.getBody());
    }

    public BankAccount getAccountByAccountNumber(String accountNumber) {
        return repo.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
    }
}
