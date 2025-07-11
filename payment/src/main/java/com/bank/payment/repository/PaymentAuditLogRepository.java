package com.bank.payment.repository;

import com.bank.payment.model.PaymentAuditLog;
import com.bank.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentAuditLogRepository extends JpaRepository<PaymentAuditLog, Long> {
    void deleteByPayment(Payment payment);
}