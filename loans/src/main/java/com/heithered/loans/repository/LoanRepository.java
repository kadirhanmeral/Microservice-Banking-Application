package com.heithered.loans.repository;

import com.heithered.loans.dto.LoanResponseDto;
import com.heithered.loans.entity.Loan;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface LoanRepository extends ReactiveCrudRepository<Loan, UUID>, LoanRepositoryCustom {

    Flux<Loan> findAllByCustomerId(UUID customerId);

    Mono<Loan> findLoanByLoanId(UUID loanId);

    Mono<ResponseEntity<Void>> deleteLoanByLoanId(UUID loanId);
}
