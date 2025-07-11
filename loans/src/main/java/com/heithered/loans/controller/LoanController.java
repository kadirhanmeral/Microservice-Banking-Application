package com.heithered.loans.controller;

import com.heithered.loans.dto.*;
import com.heithered.loans.entity.LoanStatus;
import com.heithered.loans.entity.LoanType;
import com.heithered.loans.service.LoanService;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/loans")
@AllArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/create")
    public Mono<ResponseEntity<LoanResponseDto>> createLoan(@RequestBody LoanRequestDto request) {
        return loanService.createLoan(request);
    }

    @GetMapping("/{loanId}")
    public Mono<ResponseEntity<LoanResponseDto>> getLoan(@PathVariable UUID loanId) {
        return loanService.getLoanById(loanId);
    }

    @PutMapping("/{loanId}")
    public Mono<ResponseEntity<LoanResponseDto>> updateLoan(@PathVariable UUID loanId,
                                                            @RequestBody UpdateLoanRequestDto request) {
        return loanService.updateLoan(loanId, request);
    }

    @PutMapping("/{loanId}/status")
    public Mono<ResponseEntity<LoanResponseDto>> updateLoanStatus(
            @PathVariable UUID loanId,
            @RequestBody UpdateLoanStatusRequestDto request
    ) {
        return loanService.updateLoanStatus(loanId, request);
    }

    @DeleteMapping("/{loanId}")
    public Mono<ResponseEntity<Void>> deleteLoan(@PathVariable UUID loanId) {
        return loanService.deleteLoan(loanId);
    }

    @GetMapping("/all")
    public Mono<ResponseEntity<List<LoanResponseDto>>> getLoans(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) LoanStatus status,
            @RequestParam(required = false) LoanType loanType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return loanService.getLoansByFilters(customerId, status, loanType, startDate, endDate, page, size)
                .collectList()
                .map(ResponseEntity::ok);
    }

    @PostMapping("/eligibility")
    public Mono<ResponseEntity<LoanEligibilityResponseDto>> checkEligibility(@RequestBody LoanEligibilityRequestDto request) {
        return loanService.checkEligibility(request);
    }
}
