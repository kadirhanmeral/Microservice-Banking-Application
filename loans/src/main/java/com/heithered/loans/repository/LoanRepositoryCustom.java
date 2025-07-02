package com.heithered.loans.repository;

import com.heithered.loans.entity.Loan;
import com.heithered.loans.entity.LoanStatus;
import com.heithered.loans.entity.LoanType;
import reactor.core.publisher.Flux;

import java.time.LocalDate;
import java.util.UUID;

public interface LoanRepositoryCustom {
    Flux<Loan> findLoansByFilters(UUID customerId,
                                  LoanStatus status,
                                  LoanType loanType,
                                  LocalDate startDate,
                                  LocalDate endDate,
                                  int page,
                                  int size);
}
