package org.training.user.service.service;

import org.training.user.service.model.dto.CreateUser;
import org.training.user.service.model.dto.UserDto;
import org.training.user.service.model.dto.UserFilterDto;
import org.training.user.service.model.dto.UserUpdate;
import org.training.user.service.model.dto.UserUpdateStatus;
import org.training.user.service.model.dto.response.Response;

import java.util.List;

public interface UserService {

    Response createUser(CreateUser userDto);

    List<UserDto> readAllUsers();

    List<UserDto> readUsersWithFilters(UserFilterDto filterDto);

    UserDto readUser(String authId);

    Response updateUserStatus(Long id, UserUpdateStatus userUpdate);

    Response updateUser(Long id, UserUpdate userUpdate);

    UserDto readUserById(Long userId);

    UserDto readUserByAccountId(String accountId);
}
