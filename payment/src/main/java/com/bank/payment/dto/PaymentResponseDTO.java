package com.bank.payment.dto;

import com.bank.payment.model.PaymentStatus;
import com.bank.payment.model.PaymentType;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponseDTO {
    private String id;
    private String senderAccountId;
    private String receiverAccountId;
    private BigDecimal amount;
    private String currency;
    private PaymentType paymentType;
    private PaymentStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime scheduledAt;
    private String referenceNumber;
    private String idempotencyKey;
    private String senderEmail;
    private String receiverEmail;
}