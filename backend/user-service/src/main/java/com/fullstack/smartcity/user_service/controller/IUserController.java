package com.fullstack.smartcity.user_service.controller;

import com.fullstack.smartcity.user_service.model.CommonResponse;
import com.fullstack.smartcity.user_service.request.UserRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

public interface IUserController {

    @PostMapping("/register")
    ResponseEntity<CommonResponse> register(@RequestBody UserRequest userRequest);

    @PostMapping("/login")
    ResponseEntity<CommonResponse> login(@RequestBody UserRequest userRequest);

    @GetMapping("/get-all")
    ResponseEntity<CommonResponse> getAllUsers();

    @GetMapping("/get-all-citizens")
    ResponseEntity<CommonResponse> getAllCitizens();

    @GetMapping("/get/{userId}")
    ResponseEntity<CommonResponse> getUserById(@PathVariable String userId);

    @PutMapping("/update")
    ResponseEntity<CommonResponse> updateUser(HttpServletRequest request, @RequestBody UserRequest userRequest);

    @DeleteMapping("/delete/{userId}")
    ResponseEntity<CommonResponse> deleteUser(@PathVariable String userId);

    @PostMapping("/logout")
    ResponseEntity<CommonResponse> logout(@RequestHeader("Authorization") String authHeader);

}