package com.example.accountmicroservice.repository;

import com.example.accountmicroservice.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    List<BankAccount> findByUserId(String userId);
    boolean existsByAccountNumber(String accountNumber);
    Optional<BankAccount> findByAccountNumber(String accountNumber);
}