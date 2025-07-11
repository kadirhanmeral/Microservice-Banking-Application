package com.bank.payment.service;

import com.bank.payment.model.Payment;

public interface NotificationService {
    void sendPaymentNotification(Payment payment);
} 