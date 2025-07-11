package com.bank.payment.service;

import com.bank.payment.dto.BillPaymentRequestDTO;
import com.bank.payment.dto.PaymentRequestDTO;
import com.bank.payment.dto.PaymentResponseDTO;
import com.bank.payment.model.Payment;

public interface PaymentService {
    PaymentResponseDTO processPayment(PaymentRequestDTO paymentRequest);
    Payment getPaymentDetails(String paymentId);
    java.util.List<Payment> getAllPayments();
    void deletePayment(String paymentId);
    PaymentResponseDTO updatePayment(String paymentId, PaymentRequestDTO request);
}