package com.fullstack.smartcity.user_service.controller.impl;

import com.fullstack.smartcity.user_service.controller.IUserController;
import com.fullstack.smartcity.user_service.model.CommonResponse;
import com.fullstack.smartcity.user_service.model.ResponseStatus;
import com.fullstack.smartcity.user_service.request.UserRequest;
import com.fullstack.smartcity.user_service.service.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequestMapping("user")
@CrossOrigin("*")
@RestController
public class UserController implements IUserController {

    @Autowired
    private IUserService userService;

    @Override
    public ResponseEntity<CommonResponse> register(UserRequest userRequest) {
        try{
            CommonResponse response = userService.register(userRequest);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Register User");
        }
    }

    @Override
    public ResponseEntity<CommonResponse> login(@RequestBody UserRequest userRequest){
        try{
            CommonResponse response = userService.login(userRequest);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Login User");
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponse> getAllUsers() {
        try{
            CommonResponse response = userService.getAllUsers();
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Get Users");
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponse> getAllCitizens() {
        try{
            CommonResponse response = userService.getAllCitizens();
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Get Citizens");
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','WORKER','CITIZEN')")
    public ResponseEntity<CommonResponse> getUserById(String userId) {
        try{
            CommonResponse response = userService.getUserById(userId);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Get User By Id");
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','WORKER','CITIZEN')")
    public ResponseEntity<CommonResponse> updateUser(HttpServletRequest request, UserRequest userRequest) {
        try{
            CommonResponse response = userService.updateUser(request,userRequest);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Update User");
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponse> deleteUser(String userId) {
        try{
            CommonResponse response = userService.deleteUser(userId);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Delete User");
        }
    }

    @Override
    public ResponseEntity<CommonResponse> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            CommonResponse response = userService.logout(token);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Logout User");
        }
    }


    public ResponseEntity<CommonResponse> exceptionHandler(Exception ex, String contextMessage) {
        CommonResponse response = new CommonResponse();
        response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.setResponseStatus(ResponseStatus.FAILED);
        response.setMessage("Internal Server Error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
