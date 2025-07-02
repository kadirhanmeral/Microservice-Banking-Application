package com.heithered.loans.dto;

import java.time.OffsetDateTime;

public record ProblemDetailDto(String type,            // URI reference that identifies the problem type
                               String title,           // Short, human-readable summary
                               int status,             // HTTP status code
                               String detail,          // Detailed explanation
                               String instance,        // URI of the request path (optional)
                               OffsetDateTime timestamp) {
}
