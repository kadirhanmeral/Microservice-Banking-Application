package com.bank.payment.service.impl;

import com.bank.payment.dto.BillPaymentRequestDTO;
import com.bank.payment.dto.PaymentRequestDTO;
import com.bank.payment.dto.PaymentResponseDTO;
import com.bank.payment.exception.PaymentException;
import com.bank.payment.exception.PaymentNotFoundException;
import com.bank.payment.model.Payment;
import com.bank.payment.model.PaymentAuditLog;
import com.bank.payment.model.PaymentStatus;
import com.bank.payment.model.PaymentType;
import com.bank.payment.repository.PaymentAuditLogRepository;
import com.bank.payment.repository.PaymentRepository;
import com.bank.payment.service.AccountServiceClient;
import com.bank.payment.service.PaymentService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentAuditLogRepository auditLogRepository;
    private final AccountServiceClient accountServiceClient;

    @Override
    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO paymentRequest) {
        // Check for idempotency
        if (paymentRequest.getIdempotencyKey() != null) {
            Payment existingPayment = paymentRepository.findByIdempotencyKey(paymentRequest.getIdempotencyKey()).orElse(null);
            if (existingPayment != null) {
                log.info("Duplicate payment request detected with idempotency key: {}", paymentRequest.getIdempotencyKey());
                return mapToResponseDTO(existingPayment);
            }
        }

        validateAccounts(paymentRequest);

        Payment payment = createPaymentEntity(paymentRequest, false);
        payment.setStatus(PaymentStatus.PROCESSING);
        payment = paymentRepository.save(payment);

        createAuditLog(payment, payment.getStatus().toString(), "Payment processing started");

        try {
            boolean success = processAccountTransfer(
                    paymentRequest.getSenderAccountId(),
                    paymentRequest.getReceiverAccountId(),
                    paymentRequest.getAmount().toString(),
                    paymentRequest.getCurrency()
            );

            payment.setStatus(success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED);
            paymentRepository.save(payment);

            createAuditLog(payment, payment.getStatus().toString(),
                    success ? "Payment completed successfully" : "Payment failed during account transfer");

            if (success) {
            }

            return mapToResponseDTO(payment);
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            createAuditLog(payment, "FAILED", "Payment processing error: " + e.getMessage());
            log.error("Payment processing failed for payment ID: {}", payment.getId(), e);
            throw new PaymentException("Payment processing failed: " + e.getMessage());
        }
    }

    @Override
    public Payment getPaymentDetails(String paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + paymentId));
    }

    @Override
    public java.util.List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    @Transactional
    public void deletePayment(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + paymentId));
        // Önce audit log'ları sil
        auditLogRepository.deleteByPayment(payment);
        // Sonra ödemeyi sil
        paymentRepository.delete(payment);
    }

    @Override
    @Transactional
    public PaymentResponseDTO updatePayment(String paymentId, PaymentRequestDTO request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + paymentId));
        // Sadece açıklama, tutar ve currency güncellenebilir örnek olarak
        if (request.getAmount() != null) payment.setAmount(request.getAmount());
        if (request.getCurrency() != null) payment.setCurrency(request.getCurrency());
        if (request.getDescription() != null) payment.setDescription(request.getDescription());
        paymentRepository.save(payment);
        createAuditLog(payment, payment.getStatus().toString(), "Payment updated");
        return mapToResponseDTO(payment);
    }

    private Payment createPaymentEntity(PaymentRequestDTO request, boolean isScheduled) {
        Payment payment = new Payment();
        payment.setSenderAccountId(request.getSenderAccountId());
        payment.setReceiverAccountId(request.getReceiverAccountId());
        payment.setSenderEmail(request.getSenderEmail());
        payment.setReceiverEmail(request.getReceiverEmail());
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setPaymentType(request.getPaymentType());
        payment.setDescription(request.getDescription());
        payment.setIdempotencyKey(request.getIdempotencyKey());
        if (isScheduled) {
            payment.setScheduledAt(request.getScheduledAt());
        }
        payment.setReferenceNumber(UUID.randomUUID().toString());
        return payment;
    }

    private void validateAccounts(PaymentRequestDTO request) {
        if (!validateAccountWithCircuitBreaker(request.getSenderAccountId())) {
            throw new PaymentException("Invalid sender account");
        }

        if (!validateAccountWithCircuitBreaker(request.getReceiverAccountId())) {
            throw new PaymentException("Invalid receiver account");
        }
    }

    private void createAuditLog(Payment payment, String status, String details) {
        PaymentAuditLog log = new PaymentAuditLog();
        log.setPayment(payment);
        log.setStatus(status);
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    private PaymentResponseDTO mapToResponseDTO(Payment payment) {
        PaymentResponseDTO responseDTO = new PaymentResponseDTO();
        responseDTO.setId(payment.getId());
        responseDTO.setSenderAccountId(payment.getSenderAccountId());
        responseDTO.setReceiverAccountId(payment.getReceiverAccountId());
        responseDTO.setSenderEmail(payment.getSenderEmail());
        responseDTO.setReceiverEmail(payment.getReceiverEmail());
        responseDTO.setAmount(payment.getAmount());
        responseDTO.setCurrency(payment.getCurrency());
        responseDTO.setPaymentType(payment.getPaymentType());
        responseDTO.setStatus(payment.getStatus());
        responseDTO.setDescription(payment.getDescription());
        responseDTO.setCreatedAt(payment.getCreatedAt());
        responseDTO.setScheduledAt(payment.getScheduledAt());
        responseDTO.setReferenceNumber(payment.getReferenceNumber());
        responseDTO.setIdempotencyKey(payment.getIdempotencyKey());
        return responseDTO;
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "processAccountTransferFallback")
    @Retry(name = "paymentService")
    private boolean processAccountTransfer(String senderAccountId, String receiverAccountId, String amount, String currency) {
        return accountServiceClient.processTransfer(senderAccountId, receiverAccountId, amount, currency);
    }

    private boolean processAccountTransferFallback(String senderAccountId, String receiverAccountId, String amount, String currency, Exception ex) {
        log.warn("Account service unavailable, using fallback for transfer: sender={}, receiver={}, amount={}, currency={}, error={}", 
                senderAccountId, receiverAccountId, amount, currency, ex.getMessage());
        return false; // Return false to indicate failure
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "validateAccountFallback")
    @Retry(name = "paymentService")
    private boolean validateAccountWithCircuitBreaker(String accountId) {
        return accountServiceClient.validateAccount(accountId);
    }

    private boolean validateAccountFallback(String accountId, Exception ex) {
        log.warn("Account validation service unavailable for account: {}, error: {}", accountId, ex.getMessage());
        return false;
    }
}