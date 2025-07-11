package com.bank.payment.dto;

import com.bank.payment.model.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentRequestDTO {
    @NotBlank(message = "Sender account ID is required")
    @Size(min = 1, max = 50, message = "Sender account ID must be between 1 and 50 characters")
    private String senderAccountId;

    @NotBlank(message = "Receiver account ID is required")
    @Size(min = 1, max = 50, message = "Receiver account ID must be between 1 and 50 characters")
    private String receiverAccountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be exactly 3 characters")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be 3 uppercase letters (e.g., USD, EUR)")
    private String currency;

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Future(message = "Scheduled date must be in the future")
    private LocalDateTime scheduledAt;

    @Size(max = 100, message = "Idempotency key must not exceed 100 characters")
    private String idempotencyKey;

    @NotBlank(message = "Sender email is required")
    private String senderEmail;

    @NotBlank(message = "Receiver email is required")
    private String receiverEmail;
}