package com.heithered.loans.service;

import com.heithered.loans.dto.*;
import com.heithered.loans.entity.Currency;
import com.heithered.loans.entity.Loan;
import com.heithered.loans.entity.LoanStatus;
import com.heithered.loans.entity.LoanType;
import com.heithered.loans.exception.*;
import com.heithered.loans.mapper.EntityDtoMapper;
import com.heithered.loans.repository.LoanRepository;
import com.heithered.loans.validation.LoanCreateValidator;
import com.heithered.loans.validation.LoanEligibilityValidator;
import com.heithered.loans.validation.LoanStatusUpdateValidator;
import com.heithered.loans.validation.LoanUpdateValidator;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;


@Service
@AllArgsConstructor
public class LoanService {

    private static final Set<LoanStatus> RELEVANT_STATUSES = Set.of(LoanStatus.ACTIVE, LoanStatus.DEFAULTED);

    private final LoanRepository loanRepository;
    private final CurrencyConversionService currencyConversionService;
    private final LoanCreateValidator loanCreateValidator;
    private final LoanEligibilityValidator loanEligibilityValidator;
    private final LoanUpdateValidator loanUpdateValidator;
    private final LoanStatusUpdateValidator loanStatusUpdateValidator;


    public Mono<ResponseEntity<LoanResponseDto>> createLoan(LoanRequestDto request) {
        loanCreateValidator.validate(request);
        Loan loan = EntityDtoMapper.toEntity(request);
        return loanRepository.save(loan)
                .map(EntityDtoMapper::toResponseDto)
                .map(ResponseEntity::ok);
    }

    public Flux<LoanResponseDto> getLoansByCustomerId(UUID customerId) {
        return loanRepository.findAllByCustomerId(customerId)
                .map(EntityDtoMapper::toResponseDto);
    }

    public Mono<ResponseEntity<LoanResponseDto>> getLoanById(UUID loanId) {
        return loanRepository.findLoanByLoanId(loanId)
                .map(EntityDtoMapper::toResponseDto)
                .switchIfEmpty(Mono.error(new LoanNotFoundException("Loan not found with ID: " + loanId)))
                .map(ResponseEntity::ok);
    }

    public Mono<ResponseEntity<LoanResponseDto>> updateLoan(UUID loanId, UpdateLoanRequestDto request) {
        loanUpdateValidator.validate(request);
        return loanRepository.findLoanByLoanId(loanId)
                .switchIfEmpty(Mono.error(new LoanNotFoundException("Loan not found with ID: " + loanId)))
                .flatMap(existingLoan -> {
                    EntityDtoMapper.updateEntityFromDto(existingLoan, request);
                    return loanRepository.save(existingLoan);
                })
                .map(EntityDtoMapper::toResponseDto)
                .map(ResponseEntity::ok);
    }

    public Mono<ResponseEntity<LoanResponseDto>> updateLoanStatus(UUID loanId, UpdateLoanStatusRequestDto request) {
        loanStatusUpdateValidator.validate(request);
        return loanRepository.findLoanByLoanId(loanId)
                .switchIfEmpty(Mono.error(new LoanNotFoundException("Loan not found with ID: " + loanId)))
                .flatMap(existingLoan -> {
                    EntityDtoMapper.updateStatusFromDto(existingLoan, request);
                    return loanRepository.save(existingLoan);
                })
                .map(EntityDtoMapper::toResponseDto)
                .map(ResponseEntity::ok);
    }


    public Mono<ResponseEntity<Void>> deleteLoan(UUID loanId) {
        return loanRepository.findLoanByLoanId(loanId)
                .switchIfEmpty(Mono.error(new LoanNotFoundException("Loan not found with ID: " + loanId)))
                .flatMap(loanRepository::delete)
                .thenReturn(ResponseEntity.noContent().build());
    }

    public Flux<LoanResponseDto> getLoansByFilters(UUID customerId,
                                                   LoanStatus status,
                                                   LoanType loanType,
                                                   LocalDate startDate,
                                                   LocalDate endDate,
                                                   int page,
                                                   int size) {

        return loanRepository.findLoansByFilters(customerId, status, loanType, startDate, endDate, page, size)
                .map(EntityDtoMapper::toResponseDto);
    }

    public Mono<ResponseEntity<LoanEligibilityResponseDto>> checkEligibility(LoanEligibilityRequestDto request) {
        loanEligibilityValidator.validate(request);

        UUID customerId = request.customerId();
        BigDecimal income = request.monthlyIncome();
        Currency incomeCurrency = request.incomeCurrency();

        Mono<List<Loan>> existingLoansMono = loanRepository.findAllByCustomerId(customerId)
                .filter(loan -> RELEVANT_STATUSES.contains(loan.getStatus()))
                .collectList();

        return existingLoansMono.map(loans -> {
            BigDecimal existingPayments = loans.stream()
                    .map(loan -> {
                        BigDecimal payment = calculateMonthlyPayment(loan);
                        // Convert loan payment to income currency
                        return currencyConversionService.convert(payment, loan.getCurrency(), incomeCurrency);
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal newLoanPayment = calculateMonthlyPayment(
                    request.loanAmount(),
                    request.interestRate(),
                    request.termInMonths()
            );

            // Convert new loan payment from loanCurrency to incomeCurrency
            BigDecimal newLoanPaymentInIncomeCurrency = currencyConversionService.convert(
                    newLoanPayment,
                    request.loanCurrency(),
                    incomeCurrency
            );

            BigDecimal totalObligation = existingPayments.add(newLoanPaymentInIncomeCurrency);
            BigDecimal maxAllowed = income.multiply(BigDecimal.valueOf(0.5));

            boolean eligible = totalObligation.compareTo(maxAllowed) <= 0;

            String reason = eligible
                    ? "Eligible"
                    : String.format("Total monthly obligations (%.2f) %s exceed 50%% of income (%.2f) %s",
                    totalObligation, incomeCurrency, maxAllowed, incomeCurrency);

            return new LoanEligibilityResponseDto(eligible, reason);
        }).map(ResponseEntity::ok);
    }


    private BigDecimal calculateMonthlyPayment(Loan loan) {
        return calculateMonthlyPayment(loan.getLoanAmount(), loan.getInterestRate(), loan.getTermInMonths());
    }

    private BigDecimal calculateMonthlyPayment(BigDecimal amount, BigDecimal annualInterestRate, int termInMonths) {
        if (amount == null || annualInterestRate == null || termInMonths == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal monthlyInterestRate = annualInterestRate.divide(BigDecimal.valueOf(12 * 100), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusRPowerN = BigDecimal.ONE.add(monthlyInterestRate).pow(termInMonths);

        BigDecimal numerator = amount.multiply(monthlyInterestRate).multiply(onePlusRPowerN);
        BigDecimal denominator = onePlusRPowerN.subtract(BigDecimal.ONE);

        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

}
