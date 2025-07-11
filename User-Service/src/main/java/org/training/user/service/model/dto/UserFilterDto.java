package org.training.user.service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFilterDto {
    
    private String firstName;
    private String lastName;
    private String emailId;
    private String contactNumber;
    private String status;
    private String identity;
    private String gender;
    private String occupation;
    private String nationality;
} 