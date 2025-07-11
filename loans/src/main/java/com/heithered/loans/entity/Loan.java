package com.heithered.loans.entity;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.UUID;

@Data
@Table("loans")
public class Loan {

    @Id
    private UUID loanId;
    private UUID customerId;
    private LoanType loanType;
    private BigDecimal loanAmount;
    private Currency currency;
    private Integer termInMonths;
    private BigDecimal interestRate;
    private RepaymentFrequency repaymentFrequency;
    private LoanStatus status;
    private BigDecimal outstandingBalance;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextDueDate;
    private UUID coSignerId;
    private String collateral;
    private LocalDateTime createdAt;
    private LocalDateTime  updatedAt;

}