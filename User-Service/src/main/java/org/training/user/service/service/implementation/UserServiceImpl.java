package org.training.user.service.service.implementation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.training.user.service.exception.EmptyFields;
import org.training.user.service.exception.ResourceConflictException;
import org.training.user.service.exception.ResourceNotFound;
import org.training.user.service.external.AccountService;
import org.training.user.service.model.Status;
import org.training.user.service.model.dto.CreateUser;
import org.training.user.service.model.dto.UserDto;
import org.training.user.service.model.dto.UserFilterDto;
import org.training.user.service.model.dto.UserUpdate;
import org.training.user.service.model.dto.UserUpdateStatus;
import org.training.user.service.model.dto.response.Response;
import org.training.user.service.model.entity.User;
import org.training.user.service.model.entity.UserProfile;
import org.training.user.service.model.external.Account;
import org.training.user.service.model.mapper.UserMapper;
import org.training.user.service.repository.UserRepository;
import org.training.user.service.service.KeycloakService;
import org.training.user.service.service.UserService;
import org.training.user.service.utils.FieldChecker;

import javax.transaction.Transactional;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final KeycloakService keycloakService;
    private final AccountService accountService;

    private UserMapper userMapper = new UserMapper();

    @Value("${spring.application.success}")
    private String responseCodeSuccess;

    @Value("${spring.application.not_found}")
    private String responseCodeNotFound;

    @Override
    public Response createUser(CreateUser userDto) {
        if (FieldChecker.hasEmptyFields(userDto)) {
            log.error("User creation failed: empty fields detected");
            throw new EmptyFields("Please fill all required fields", responseCodeNotFound);
        }

        List<UserRepresentation> existingUsers = keycloakService.readUserByEmail(userDto.getEmailId());
        if (!existingUsers.isEmpty()) {
            log.error("User creation failed: email already exists");
            throw new ResourceConflictException("Email already exists");
        }

        UserRepresentation userRepresentation = getUserRepresentation(userDto);
        Integer authId = keycloakService.createUser(userRepresentation);

        UserProfile userProfile = UserProfile.builder()
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName()).build();

        User user = User.builder()
                .emailId(userDto.getEmailId())
                .contactNo(userDto.getContactNumber())
                .status(Status.PENDING)
                .userProfile(userProfile)
                .authId(authId.toString())
                .identity(userDto.getIdentity()).build();

        userRepository.save(user);

        log.info("User created successfully with email: {}", userDto.getEmailId());
        return Response.builder()
                .responseMessage("User created successfully")
                .responseCode(responseCodeSuccess).build();
    }

    private static UserRepresentation getUserRepresentation(CreateUser userDto) {
        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setUsername(userDto.getEmailId());
        userRepresentation.setFirstName(userDto.getFirstName());
        userRepresentation.setLastName(userDto.getLastName());
        userRepresentation.setEmailVerified(true);
        userRepresentation.setEnabled(true);
        userRepresentation.setEmail(userDto.getEmailId());

        CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
        credentialRepresentation.setValue(userDto.getPassword());
        credentialRepresentation.setTemporary(false);
        userRepresentation.setCredentials(Collections.singletonList(credentialRepresentation));
        return userRepresentation;
    }

    @Override
    public List<UserDto> readAllUsers() {
        List<User> users = userRepository.findAll();

        Map<String, UserRepresentation> userRepresentationMap = keycloakService.readUsers(users.stream().map(user -> user.getAuthId()).collect(Collectors.toList()))
                .stream().collect(Collectors.toMap(UserRepresentation::getId, Function.identity()));

        return users.stream().map(user -> {
            UserDto userDto = userMapper.convertToDto(user);
            UserRepresentation userRepresentation = userRepresentationMap.get(user.getAuthId());
            userDto.setUserId(user.getUserId());
            userDto.setEmailId(userRepresentation.getEmail());
            userDto.setIdentificationNumber(user.getIdentity());
            userDto.setContactNo(user.getContactNo());
            return userDto;
        }).collect(Collectors.toList());
    }

    @Override
    public List<UserDto> readUsersWithFilters(UserFilterDto filterDto) {
        Status status = null;
        if (filterDto.getStatus() != null && !filterDto.getStatus().trim().isEmpty()) {
            try {
                status = Status.valueOf(filterDto.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", filterDto.getStatus());
            }
        }

        List<User> users = userRepository.findUsersWithFilters(
                filterDto.getFirstName() != null && !filterDto.getFirstName().trim().isEmpty() ? filterDto.getFirstName() : null,
                filterDto.getLastName() != null && !filterDto.getLastName().trim().isEmpty() ? filterDto.getLastName() : null,
                filterDto.getEmailId() != null && !filterDto.getEmailId().trim().isEmpty() ? filterDto.getEmailId() : null,
                filterDto.getContactNumber() != null && !filterDto.getContactNumber().trim().isEmpty() ? filterDto.getContactNumber() : null,
                status,
                filterDto.getIdentity() != null && !filterDto.getIdentity().trim().isEmpty() ? filterDto.getIdentity() : null,
                filterDto.getGender() != null && !filterDto.getGender().trim().isEmpty() ? filterDto.getGender() : null,
                filterDto.getOccupation() != null && !filterDto.getOccupation().trim().isEmpty() ? filterDto.getOccupation() : null,
                filterDto.getNationality() != null && !filterDto.getNationality().trim().isEmpty() ? filterDto.getNationality() : null
        );

        if (users.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, UserRepresentation> userRepresentationMap = keycloakService.readUsers(users.stream().map(user -> user.getAuthId()).collect(Collectors.toList()))
                .stream().collect(Collectors.toMap(UserRepresentation::getId, Function.identity()));

        return users.stream().map(user -> {
            UserDto userDto = userMapper.convertToDto(user);
            UserRepresentation userRepresentation = userRepresentationMap.get(user.getAuthId());
            userDto.setUserId(user.getUserId());
            userDto.setEmailId(userRepresentation.getEmail());
            userDto.setIdentificationNumber(user.getIdentity());
            userDto.setContactNo(user.getContactNo());
            return userDto;
        }).collect(Collectors.toList());
    }

    @Override
    public UserDto readUser(String authId) {
        User user = userRepository.findUserByAuthId(authId).
                orElseThrow(() -> new ResourceNotFound("User not found on the server"));

        UserRepresentation userRepresentation = keycloakService.readUser(authId);
        UserDto userDto = userMapper.convertToDto(user);
        userDto.setEmailId(userRepresentation.getEmail());
        return userDto;
    }

    @Override
    public Response updateUserStatus(Long id, UserUpdateStatus userUpdate) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFound("User not found on the server"));

        if (FieldChecker.hasEmptyFields(user)) {
            log.error("User is not updated completely");
            throw new EmptyFields("Please update the user", responseCodeNotFound);
        }

        if(userUpdate.getStatus().equals(Status.APPROVED)){
            UserRepresentation userRepresentation = keycloakService.readUser(user.getAuthId());
            userRepresentation.setEnabled(true);
            userRepresentation.setEmailVerified(true);
            keycloakService.updateUser(userRepresentation);
        }

        user.setStatus(userUpdate.getStatus());
        userRepository.save(user);

        return Response.builder()
                .responseMessage("User updated successfully")
                .responseCode(responseCodeSuccess).build();
    }

    @Override
    public UserDto readUserById(Long userId) {
        return userRepository.findById(userId)
                .map(user -> userMapper.convertToDto(user))
                .orElseThrow(() -> new ResourceNotFound("User not found on the server"));
    }

    @Override
    public Response updateUser(Long id, UserUpdate userUpdate) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("User not found on the server"));

        user.setContactNo(userUpdate.getContactNo());
        BeanUtils.copyProperties(userUpdate, user.getUserProfile());
        userRepository.save(user);

        return Response.builder()
                .responseCode(responseCodeSuccess)
                .responseMessage("User updated successfully").build();
    }

    @Override
    public UserDto readUserByAccountId(String accountId) {
        ResponseEntity<Account> response = accountService.readByAccountNumber(accountId);
        if(Objects.isNull(response.getBody())){
            throw new ResourceNotFound("Account not found on the server");
        }
        Long userId = response.getBody().getUserId();
        return userRepository.findById(userId)
                .map(user -> userMapper.convertToDto(user))
                .orElseThrow(() -> new ResourceNotFound("User not found on the server"));
    }
}
