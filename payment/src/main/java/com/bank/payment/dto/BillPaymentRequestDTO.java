package com.bank.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BillPaymentRequestDTO {
    @NotBlank(message = "Account ID is required")
    @Size(min = 1, max = 50, message = "Account ID must be between 1 and 50 characters")
    private String accountId;
    
    @NotBlank(message = "Biller code is required")
    @Size(min = 1, max = 20, message = "Biller code must be between 1 and 20 characters")
    private String billerCode;
    
    @NotBlank(message = "Subscriber number is required")
    @Size(min = 1, max = 50, message = "Subscriber number must be between 1 and 50 characters")
    private String subscriberNumber;
    
    @NotBlank(message = "Amount is required")
    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "Amount must be a valid number with up to 2 decimal places")
    private String amount;
    
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be exactly 3 characters")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be 3 uppercase letters (e.g., USD, EUR)")
    private String currency;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Size(max = 100, message = "Idempotency key must not exceed 100 characters")
    private String idempotencyKey;
}