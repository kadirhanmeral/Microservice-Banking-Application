package com.heithered.loans.mapper;

import com.heithered.loans.dto.LoanRequestDto;
import com.heithered.loans.dto.LoanResponseDto;
import com.heithered.loans.dto.UpdateLoanRequestDto;
import com.heithered.loans.dto.UpdateLoanStatusRequestDto;
import com.heithered.loans.entity.*;
import com.heithered.loans.exception.InvalidCurrencyException;
import com.heithered.loans.exception.InvalidLoanTypeException;
import com.heithered.loans.exception.InvalidRepaymentFrequencyException;

import java.time.LocalDateTime;



public class EntityDtoMapper {

    public static Loan toEntity(LoanRequestDto dto) {
        Loan loan = new Loan();

        loan.setCustomerId(dto.customerId());

        try {
            loan.setLoanType(LoanType.valueOf(dto.loanType()));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidLoanTypeException("Invalid loan type: " + dto.loanType());
        }

        loan.setLoanAmount(dto.loanAmount());

        try {
            loan.setCurrency(Currency.valueOf(dto.currency().toUpperCase()));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidCurrencyException("Invalid currency: " + dto.currency());
        }

        try {
            loan.setRepaymentFrequency(RepaymentFrequency.valueOf(dto.repaymentFrequency()));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidRepaymentFrequencyException("Invalid repayment frequency: " + dto.repaymentFrequency());
        }

        loan.setTermInMonths(dto.termInMonths());
        loan.setInterestRate(dto.interestRate());

        loan.setStatus(LoanStatus.PENDING); // Default status
        loan.setOutstandingBalance(dto.loanAmount());
        loan.setStartDate(dto.startDate());
        loan.setEndDate(dto.endDate());
        loan.setNextDueDate(null); // set later if needed
        loan.setCoSignerId(dto.coSignerId());
        loan.setCollateral(dto.collateral());
        loan.setCreatedAt(LocalDateTime.now());
        loan.setUpdatedAt(LocalDateTime.now());

        return loan;
    }


    public static LoanResponseDto toResponseDto(Loan loan) {
        return new LoanResponseDto(
                loan.getLoanId(),
                loan.getCustomerId(),
                loan.getLoanType().name(),
                loan.getLoanAmount(),
                loan.getCurrency(),
                loan.getTermInMonths(),
                loan.getInterestRate(),
                loan.getRepaymentFrequency().name(),
                loan.getStatus().name(),
                loan.getOutstandingBalance(),
                loan.getStartDate(),
                loan.getEndDate()
        );
    }

    public static void updateEntityFromDto(Loan existingLoan, UpdateLoanRequestDto dto) {
        existingLoan.setLoanAmount(dto.loanAmount());
        existingLoan.setTermInMonths(dto.termInMonths());
        existingLoan.setInterestRate(dto.interestRate());
        existingLoan.setEndDate(dto.endDate());
        existingLoan.setUpdatedAt(LocalDateTime.now());
    }

    public static void updateStatusFromDto(Loan loan, UpdateLoanStatusRequestDto dto) {
        loan.setStatus(dto.loanStatus());
        loan.setUpdatedAt(LocalDateTime.now());
    }

}
