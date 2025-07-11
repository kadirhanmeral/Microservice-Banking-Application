package com.bank.payment.controller;

import com.bank.payment.dto.BillPaymentRequestDTO;
import com.bank.payment.dto.PaymentRequestDTO;
import com.bank.payment.dto.PaymentResponseDTO;
import com.bank.payment.model.Payment;
import com.bank.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Controller", description = "APIs for payment operations")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Get payment details", description = "Retrieves details of a specific payment")
    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getPaymentDetails(
            @PathVariable String paymentId) {
        Payment payment = paymentService.getPaymentDetails(paymentId);
        return ResponseEntity.ok(payment);
    }

    @Operation(summary = "List all payments", description = "Retrieves all payments")
    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "minAmount", required = false) String minAmount,
            @RequestParam(value = "maxAmount", required = false) String maxAmount) {
        List<Payment> payments = paymentService.getAllPaymentsFiltered(startDate, endDate, status, minAmount, maxAmount);
        return ResponseEntity.ok(payments);
    }

    @Operation(summary = "Create a payment", description = "Creates a new payment (generic endpoint)",
        responses = {
            @ApiResponse(responseCode = "201", description = "Payment created",
                content = @Content(schema = @Schema(implementation = PaymentResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        })
    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(
            @Valid @RequestBody PaymentRequestDTO request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey) {
        if (idempotencyKey != null) {
            request.setIdempotencyKey(idempotencyKey);
        }
        PaymentResponseDTO response = paymentService.processPayment(request);
        return ResponseEntity.status(201).body(response);
    }

    @Operation(summary = "Delete a payment", description = "Deletes a payment by ID",
        responses = {
            @ApiResponse(responseCode = "204", description = "Payment deleted", content = @Content),
            @ApiResponse(responseCode = "404", description = "Not found", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        })
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(
            @PathVariable String paymentId) {
        paymentService.deletePayment(paymentId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update a payment", description = "Updates a payment by ID",
        responses = {
            @ApiResponse(responseCode = "200", description = "Payment updated",
                content = @Content(schema = @Schema(implementation = PaymentResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Not found", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        })
    @PutMapping("/{paymentId}")
    public ResponseEntity<PaymentResponseDTO> updatePayment(
            @PathVariable String paymentId,
            @Valid @RequestBody PaymentRequestDTO request) {
        PaymentResponseDTO response = paymentService.updatePayment(paymentId, request);
        return ResponseEntity.ok(response);
    }
}