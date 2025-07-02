package com.heithered.loans.exception;

import com.heithered.loans.dto.ProblemDetailDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ServerWebExchange;

import java.time.OffsetDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(LoanNotFoundException.class)
    public ResponseEntity<ProblemDetailDto> handleLoanNotFound(LoanNotFoundException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/loan-not-found",   // type URI
                "Loan Not Found",                                 // title
                HttpStatus.NOT_FOUND.value(),                     // status
                ex.getMessage(),                                  // detail
                exchange.getRequest().getPath().value(),          // instance (request path)
                OffsetDateTime.now()                              // timestamp
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(InvalidLoanTypeException.class)
    public ResponseEntity<ProblemDetailDto> handleInvalidLoanType(InvalidLoanTypeException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/invalid-loan-type",  // type URI
                "Invalid Loan Type",                                 // title
                HttpStatus.BAD_REQUEST.value(),                      // status
                ex.getMessage(),                                     // detail
                exchange.getRequest().getPath().value(),            // instance (request path)
                OffsetDateTime.now()                                 // timestamp
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(InvalidCurrencyException.class)
    public ResponseEntity<ProblemDetailDto> handleInvalidCurrency(InvalidCurrencyException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/invalid-currency",   // type URI
                "Missing or Invalid Currency",                                  // title
                HttpStatus.BAD_REQUEST.value(),                      // status
                ex.getMessage(),                                     // detail
                exchange.getRequest().getPath().value(),            // instance (request path)
                OffsetDateTime.now()                                 // timestamp
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(InvalidRepaymentFrequencyException.class)
    public ResponseEntity<ProblemDetailDto> handleInvalidRepaymentFrequency(InvalidRepaymentFrequencyException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/invalid-repayment-frequency",  // type URI
                "Invalid Repayment Frequency",                                // title
                HttpStatus.BAD_REQUEST.value(),                               // status
                ex.getMessage(),                                              // detail
                exchange.getRequest().getPath().value(),                      // instance (request path)
                OffsetDateTime.now()                                          // timestamp
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(InvalidCustomerIdException.class)
    public ResponseEntity<ProblemDetailDto> handleInvalidCustomerId(InvalidCustomerIdException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/invalid-customer-id",  // type URI
                "Missing or Invalid Customer ID",                         // title
                HttpStatus.BAD_REQUEST.value(),                        // status
                ex.getMessage(),                                       // detail
                exchange.getRequest().getPath().value(),              // instance (request path)
                OffsetDateTime.now()                                   // timestamp
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(InvalidInterestRateException.class)
    public ResponseEntity<ProblemDetailDto> handleInvalidInterestRate(InvalidInterestRateException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/invalid-interest-rate",  // type URI
                "Invalid Interest Rate",                                 // title
                HttpStatus.BAD_REQUEST.value(),                          // status
                ex.getMessage(),                                         // detail
                exchange.getRequest().getPath().value(),                // instance (request path)
                OffsetDateTime.now()                                     // timestamp
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(InvalidLoanAmountException.class)
    public ResponseEntity<ProblemDetailDto> handleInvalidLoanAmount(InvalidLoanAmountException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/invalid-loan-amount",  // type URI
                "Invalid Loan Amount",                                 // title
                HttpStatus.BAD_REQUEST.value(),                        // status
                ex.getMessage(),                                       // detail
                exchange.getRequest().getPath().value(),              // instance (request path)
                OffsetDateTime.now()                                   // timestamp
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(InvalidLoanStatusException.class)
    public ResponseEntity<ProblemDetailDto> handleInvalidLoanStatus(InvalidLoanStatusException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/invalid-loan-status",  // type URI
                "Invalid Loan Status",                                 // title
                HttpStatus.BAD_REQUEST.value(),                        // status
                ex.getMessage(),                                       // detail
                exchange.getRequest().getPath().value(),              // instance (request path)
                OffsetDateTime.now()                                   // timestamp
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(InvalidMonthlyIncomeException.class)
    public ResponseEntity<ProblemDetailDto> handleInvalidMonthlyIncome(InvalidMonthlyIncomeException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/invalid-monthly-income",  // type URI
                "Invalid Monthly Income",                                 // title
                HttpStatus.BAD_REQUEST.value(),                           // status
                ex.getMessage(),                                          // detail
                exchange.getRequest().getPath().value(),                 // instance (request path)
                OffsetDateTime.now()                                      // timestamp
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(InvalidTermException.class)
    public ResponseEntity<ProblemDetailDto> handleInvalidTerm(InvalidTermException ex, ServerWebExchange exchange) {
        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/invalid-term",     // type URI
                "Invalid Term",                                    // title
                HttpStatus.BAD_REQUEST.value(),                    // status
                ex.getMessage(),                                   // detail
                exchange.getRequest().getPath().value(),          // instance (request path)
                OffsetDateTime.now()                               // timestamp
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetailDto> handleGenericException(Exception ex, ServerWebExchange exchange) {
        log.error("Unhandled exception occurred", ex); // Log full stack trace

        ProblemDetailDto problem = new ProblemDetailDto(
                "https://yourdomain.com/errors/internal-server-error",  // type URI
                "Internal Server Error",                                 // title
                HttpStatus.INTERNAL_SERVER_ERROR.value(),                // status
                "An unexpected error occurred. Please contact support.", // generic detail message
                exchange.getRequest().getPath().value(),                 // instance (request path)
                OffsetDateTime.now()                                     // timestamp
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }






}

