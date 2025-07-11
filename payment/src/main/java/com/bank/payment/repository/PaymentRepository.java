package com.bank.payment.repository;

import com.bank.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    
    @Query("SELECT p FROM Payment p WHERE p.idempotencyKey = :idempotencyKey")
    Optional<Payment> findByIdempotencyKey(@Param("idempotencyKey") String idempotencyKey);
    
    @Query("SELECT p FROM Payment p WHERE p.referenceNumber = :referenceNumber")
    Optional<Payment> findByReferenceNumber(@Param("referenceNumber") String referenceNumber);
}