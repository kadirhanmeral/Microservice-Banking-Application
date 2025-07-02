CREATE TABLE IF NOT EXISTS loans (
                       loan_id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
                       customer_id BINARY(16) NOT NULL,
                       loan_type VARCHAR(30) NOT NULL,
                       loan_amount DECIMAL(15,2) NOT NULL,
                       currency VARCHAR(3) NOT NULL,
                       term_in_months INT NOT NULL,
                       interest_rate DECIMAL(5,2) NOT NULL,
                       repayment_frequency VARCHAR(20) NOT NULL,
                       status VARCHAR(20) NOT NULL,
                       outstanding_balance DECIMAL(15,2),
                       start_date DATE,
                       end_date DATE,
                       next_due_date DATE,
                       co_signer_id BINARY(16),
                       collateral TEXT,
                       created_at DATETIME(3) NOT NULL,
                       updated_at DATETIME(3) NOT NULL
);