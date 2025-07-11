package org.training.user.service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.training.user.service.model.dto.CreateUser;
import org.training.user.service.model.dto.UserDto;
import org.training.user.service.model.dto.UserFilterDto;
import org.training.user.service.model.dto.UserUpdate;
import org.training.user.service.model.dto.UserUpdateStatus;
import org.training.user.service.model.dto.response.Response;
import org.training.user.service.service.UserService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Response> createUser(@RequestBody CreateUser userDto) {
        log.info("Creating user: {}", userDto.getEmailId());
        return ResponseEntity.ok(userService.createUser(userDto));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> readAllUsers() {
        log.debug("Reading all users");
        return ResponseEntity.ok(userService.readAllUsers());
    }

    @GetMapping("/filter")
    public ResponseEntity<List<UserDto>> readUsersWithFilters(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String emailId,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String identity,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String occupation,
            @RequestParam(required = false) String nationality) {
        
        UserFilterDto filterDto = UserFilterDto.builder()
                .firstName(firstName)
                .lastName(lastName)
                .emailId(emailId)
                .contactNumber(contactNumber)
                .status(status)
                .identity(identity)
                .gender(gender)
                .occupation(occupation)
                .nationality(nationality)
                .build();
        
        log.debug("Filtering users with criteria: {}", filterDto);
        return ResponseEntity.ok(userService.readUsersWithFilters(filterDto));
    }

    @GetMapping("auth/{authId}")
    public ResponseEntity<UserDto> readUserByAuthId(@PathVariable String authId) {
        log.debug("Reading user by authId: {}", authId);
        return ResponseEntity.ok(userService.readUser(authId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Response> updateUserStatus(@PathVariable Long id, @RequestBody UserUpdateStatus userUpdate) {
        log.info("Updating user status for ID {}: {}", id, userUpdate.getStatus());
        return new ResponseEntity<>(userService.updateUserStatus(id, userUpdate), HttpStatus.OK);
    }

    @PutMapping("{id}")
    public ResponseEntity<Response> updateUser(@PathVariable Long id, @RequestBody UserUpdate userUpdate) {
        log.info("Updating user with ID: {}", id);
        return new ResponseEntity<>(userService.updateUser(id, userUpdate), HttpStatus.OK);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> readUserById(@PathVariable Long userId) {
        log.debug("Reading user by ID: {}", userId);
        return ResponseEntity.ok(userService.readUserById(userId));
    }

    @GetMapping("/accounts/{accountId}")
    public ResponseEntity<UserDto> readUserByAccountId(@PathVariable String accountId) {
        log.debug("Reading user by account ID: {}", accountId);
        return ResponseEntity.ok(userService.readUserByAccountId(accountId));
    }
}
