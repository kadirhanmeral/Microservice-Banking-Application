package com.heithered.loans.repository;

import com.heithered.loans.entity.*;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.nio.ByteBuffer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class LoanRepositoryCustomImpl implements LoanRepositoryCustom {

    private final DatabaseClient databaseClient;

    public LoanRepositoryCustomImpl(DatabaseClient databaseClient) {
        this.databaseClient = databaseClient;
    }

    @Override
    public Flux<Loan> findLoansByFilters(UUID customerId, LoanStatus status, LoanType loanType,
                                         LocalDate startDate, LocalDate endDate,
                                         int page, int size) {
        String baseQuery = "SELECT * FROM loans WHERE 1=1";
        List<Object> params = new ArrayList<>();

        if (customerId != null) {
            baseQuery += " AND customer_id = ?";
            params.add(customerId);
        }
        if (status != null) {
            baseQuery += " AND status = ?";
            params.add(status.name());
        }
        if (loanType != null) {
            baseQuery += " AND loan_type = ?";
            params.add(loanType.name());
        }
        if (startDate != null) {
            baseQuery += " AND start_date >= ?";
            params.add(startDate);
        }
        if (endDate != null) {
            baseQuery += " AND end_date <= ?";
            params.add(endDate);
        }

        baseQuery += " LIMIT ? OFFSET ?";
        params.add(size);
        params.add(page * size);

        DatabaseClient.GenericExecuteSpec spec = databaseClient.sql(baseQuery);

        for (int i = 0; i < params.size(); i++) {
            Object param = params.get(i);
            if (param instanceof UUID) {
                param = uuidToBytes((UUID) param);
            }
            spec = spec.bind(i, param);
        }

        return spec.map((row, metadata) -> {
            Loan loan = new Loan();

            byte[] loanIdBytes = row.get("loan_id", byte[].class);
            loan.setLoanId(bytesToUuid(loanIdBytes));

            byte[] customerIdBytes = row.get("customer_id", byte[].class);
            loan.setCustomerId(bytesToUuid(customerIdBytes));

            loan.setLoanType(LoanType.valueOf(row.get("loan_type", String.class)));
            loan.setLoanAmount(row.get("loan_amount", java.math.BigDecimal.class));
            loan.setCurrency(Currency.valueOf(row.get("currency", String.class)));
            loan.setTermInMonths(row.get("term_in_months", Integer.class));
            loan.setInterestRate(row.get("interest_rate", java.math.BigDecimal.class));
            loan.setRepaymentFrequency(RepaymentFrequency.valueOf(row.get("repayment_frequency", String.class)));
            loan.setStatus(LoanStatus.valueOf(row.get("status", String.class)));
            loan.setOutstandingBalance(row.get("outstanding_balance", java.math.BigDecimal.class));
            loan.setStartDate(row.get("start_date", LocalDate.class));
            loan.setEndDate(row.get("end_date", LocalDate.class));
            loan.setNextDueDate(row.get("next_due_date", LocalDate.class));

            byte[] coSignerIdBytes = row.get("co_signer_id", byte[].class);
            if (coSignerIdBytes != null) {
                loan.setCoSignerId(bytesToUuid(coSignerIdBytes));
            }

            loan.setCollateral(row.get("collateral", String.class));
            loan.setCreatedAt(row.get("created_at", java.time.LocalDateTime.class));
            loan.setUpdatedAt(row.get("updated_at", java.time.LocalDateTime.class));

            return loan;
        }).all();

    }

    private static byte[] uuidToBytes(UUID uuid) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }

    private static UUID bytesToUuid(byte[] bytes) {
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        long high = bb.getLong();
        long low = bb.getLong();
        return new UUID(high, low);
    }

}
