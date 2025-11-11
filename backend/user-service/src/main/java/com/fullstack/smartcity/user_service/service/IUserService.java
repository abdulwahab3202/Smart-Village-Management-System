package com.fullstack.smartcity.user_service.service;

import com.fullstack.smartcity.user_service.model.CommonResponse;
import com.fullstack.smartcity.user_service.request.UserRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface IUserService {

    CommonResponse register(UserRequest userRequest);

    CommonResponse login(UserRequest userRequest);

    CommonResponse getAllUsers();

    CommonResponse getAllCitizens();

    CommonResponse getUserById(String userId);

    CommonResponse updateUser(HttpServletRequest request, UserRequest userRequest);

    CommonResponse deleteUser(String userId);

    CommonResponse logout(String token);
}
