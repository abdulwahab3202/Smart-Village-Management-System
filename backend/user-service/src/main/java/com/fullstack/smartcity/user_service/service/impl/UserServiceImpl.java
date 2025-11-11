package com.fullstack.smartcity.user_service.service.impl;

import com.fullstack.smartcity.user_service.client.WorkerClient;
import com.fullstack.smartcity.user_service.entity.BlacklistedToken;
import com.fullstack.smartcity.user_service.entity.Citizen;
import com.fullstack.smartcity.user_service.entity.User;
import com.fullstack.smartcity.user_service.model.CommonResponse;
import com.fullstack.smartcity.user_service.model.ResponseStatus;
import com.fullstack.smartcity.user_service.model.UserRole;
import com.fullstack.smartcity.user_service.repository.BlacklistedTokenRepository;
import com.fullstack.smartcity.user_service.repository.CitizenRepository;
import com.fullstack.smartcity.user_service.repository.UserRepository;
import com.fullstack.smartcity.user_service.request.UserRequest;
import com.fullstack.smartcity.user_service.request.WorkerRequest;
import com.fullstack.smartcity.user_service.response.CitizenResponse;
import com.fullstack.smartcity.user_service.response.UserResponse;
import com.fullstack.smartcity.user_service.service.IUserService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CitizenRepository citizenRepository;

    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private WorkerClient workerClient;

    @Override
    public CommonResponse register(UserRequest userRequest) {
        CommonResponse response = new CommonResponse();
        try {
            validateRegistrationRequest(userRequest);
        } catch (IllegalArgumentException e) {
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage(e.getMessage());
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        if (userRepository.findByEmail(userRequest.getEmail()) != null) {
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Email already in use");
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        User user = toEntity(userRequest);
        user.setCreatedOn(new Date());
        user.setUpdatedOn(new Date());
        User savedUser = userRepository.save(user);

        try {
            switch (savedUser.getRole()) {
                case CITIZEN:
                    createCitizenProfile(savedUser, userRequest);
                    break;
                case WORKER:
                    createWorkerProfile(savedUser, userRequest);
                    break;
            }
        } catch (Exception e) {
            userRepository.deleteUserById(savedUser.getId());
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Failed to create user profile. Registration rolled back. Error: " + e.getMessage());
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        String token = jwtService.generateToken(savedUser);
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", toDTO(savedUser));
        response.setMessage("User Created Successfully");
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setData(data);
        response.setStatus(HttpStatus.CREATED);
        response.setStatusCode(HttpStatus.CREATED.value());
        return response;
    }

    private void createCitizenProfile(User user, UserRequest request) {
        Citizen citizen = new Citizen();
        citizen.setUserId(user.getId());
        citizen.setPhoneNumber(request.getPhoneNumber());
        citizen.setAddress(request.getAddress());
        citizen.setCity(request.getCity());
        citizen.setPinCode(request.getPinCode());
        citizenRepository.save(citizen);
    }

    private void createWorkerProfile(User user, UserRequest request) {
        WorkerRequest workerRequest = new WorkerRequest();
        workerRequest.setUserId(user.getId());
        workerRequest.setName(user.getName());
        workerRequest.setEmail(user.getEmail());
        workerRequest.setPhoneNumber(request.getPhoneNumber());
        workerRequest.setSpecialization(request.getSpecialization());
        CommonResponse workerResponse = workerClient.createWorkerProfile(workerRequest);
        if (!"SUCCESS".equalsIgnoreCase(workerResponse.getResponseStatus().toString())) {
            throw new RuntimeException("Failed to create worker profile in worker-service");
        }
    }


    @Override
    public CommonResponse login(UserRequest userRequest) {
        CommonResponse response = new CommonResponse();

        if (userRequest.getEmail() == null || userRequest.getEmail().trim().isEmpty()) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Email is required");
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        if (userRequest.getPassword() == null || userRequest.getPassword().trim().isEmpty()) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Password is required");
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userRequest.getEmail(), userRequest.getPassword())
            );

            if (authentication.isAuthenticated()) {
                User fullUser = userRepository.findByEmail(userRequest.getEmail());

                String token = jwtService.generateToken(fullUser);
                Map<String, Object> data = new HashMap<>();
                data.put("token", token);
                data.put("user", toDTO(fullUser));

                response.setResponseStatus(ResponseStatus.SUCCESS);
                response.setMessage("Logged In Successfully");
                response.setData(data);
                response.setStatus(HttpStatus.ACCEPTED);
                response.setStatusCode(HttpStatus.ACCEPTED.value());
                return response;
            } else {
                response.setResponseStatus(ResponseStatus.FAILED);
                response.setMessage("Failed to Login");
                response.setStatus(HttpStatus.UNAUTHORIZED);
                response.setStatusCode(HttpStatus.UNAUTHORIZED.value());
                return response;
            }
        } catch (Exception ex) {
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Invalid credentials");
            response.setStatus(HttpStatus.UNAUTHORIZED);
            response.setStatusCode(HttpStatus.UNAUTHORIZED.value());
            return response;
        }
    }

    @Override
    public CommonResponse getAllUsers(){
        CommonResponse response = new CommonResponse();
        List<User> users = userRepository.getAllUsers();
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Users Retrieved Successfully");
        List<UserResponse> dtos = users.stream().map(this::toDTO).toList();
        response.setData(dtos);
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse getAllCitizens(){
        CommonResponse response = new CommonResponse();
        List<Citizen> citizens = citizenRepository.getAllCitizens();
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Citizens Retrieved Successfully");
        List<CitizenResponse> dtos = citizens.stream().map(this::toCitizenDTO).toList();
        response.setData(dtos);
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse getUserById(String userId){
        CommonResponse response = new CommonResponse();
        Optional<User> userOpt = Optional.ofNullable(userRepository.getUserById(userId));
        if (userOpt.isEmpty()) {
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("User not found");
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        User user = userOpt.get();
        if(user.getRole().equals(UserRole.CITIZEN)){
            Citizen citizen = citizenRepository.findByUserId(userId);
            response.setResponseStatus(ResponseStatus.SUCCESS);
            response.setMessage("Citizen retrieved successfully");
            response.setData(toCitizenDTO(citizen));
            response.setStatus(HttpStatus.OK);
            response.setStatusCode(HttpStatus.OK.value());
            return response;
        }
        else if(user.getRole().equals(UserRole.WORKER)){
            CommonResponse commonResponse =  workerClient.getWorkerById(userId);
            CommonResponse response1 = new CommonResponse();
            response1.setResponseStatus(commonResponse.getResponseStatus());
            response1.setMessage(commonResponse.getMessage());
            response1.setData(commonResponse.getData());
            response1.setStatus(commonResponse.getStatus());
            response1.setStatusCode(commonResponse.getStatusCode());
            return response1;
        }
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Admin retrieved successfully");
        response.setData(user);
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse updateUser(HttpServletRequest request, UserRequest userRequest) {
        CommonResponse response = new CommonResponse();
        Claims userClaims = (Claims) request.getAttribute("userClaims");
        Optional<User> userOpt = Optional.ofNullable(userRepository.getUserById(userClaims.get("userId", String.class)));
        if (userOpt.isEmpty()) {
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("User not found");
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        User user = userOpt.get();
        if (userRequest.getRole() != null && !userRequest.getRole().equals(user.getRole())) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Role cannot be changed once assigned");
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }
        try {
            validateUpdateRequest(userRequest);
        } catch (IllegalArgumentException e) {
            System.out.println("catch executed");
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage(e.getMessage());
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (userRequest.getName() != null && !userRequest.getName().trim().isEmpty()) {
            user.setName(userRequest.getName());
        }
        if (userRequest.getEmail() != null && !userRequest.getEmail().trim().isEmpty()) {
            user.setEmail(userRequest.getEmail());
        }
        user.setUpdatedOn(new Date());
        userRepository.save(user);
        try {
            switch (user.getRole()) {
                case CITIZEN:
                    updateCitizenProfile(user, userRequest);
                    break;
                case WORKER:
                    updateWorkerProfile(user, userRequest);
                    break;
            }
        } catch (Exception e) {
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Failed to update user profile. Error: " + e.getMessage());
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("User Updated Successfully");
        response.setData(toDTO(user));
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    private void updateCitizenProfile(User user, UserRequest request) {
        Citizen citizen = citizenRepository.findByUserId(user.getId());
        if (citizen != null) {
            if (request.getPhoneNumber() != null) citizen.setPhoneNumber(request.getPhoneNumber());
            if (request.getAddress() != null) citizen.setAddress(request.getAddress());
            if (request.getCity() != null) citizen.setCity(request.getCity());
            if (request.getPinCode() != 0) citizen.setPinCode(request.getPinCode());
            citizenRepository.save(citizen);
        }
    }

    private void updateWorkerProfile(User user, UserRequest request) {
        WorkerRequest workerRequest = new WorkerRequest();
        workerRequest.setUserId(user.getId());
        workerRequest.setName(user.getName());
        workerRequest.setEmail(user.getEmail());
        workerRequest.setPhoneNumber(request.getPhoneNumber());
        workerRequest.setSpecialization(request.getSpecialization());

        CommonResponse workerResponse = workerClient.updateWorkerProfile(user.getId(),workerRequest);
        if (!"SUCCESS".equalsIgnoreCase(workerResponse.getResponseStatus().toString())) {
            throw new RuntimeException("Failed to update worker profile in worker-service");
        }
    }


    @Override
    public CommonResponse deleteUser(String userId) {
        CommonResponse response = new CommonResponse();
        Optional<User> userOpt = Optional.ofNullable(userRepository.getUserById(userId));

        if (userOpt.isEmpty()) {
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("User not found");
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }

        User user = userOpt.get();

        if (user.getRole().equals(UserRole.ADMIN)) {
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("ADMIN cannot be deleted");
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }

        try {
            if (user.getRole().equals(UserRole.WORKER)) {
                workerClient.deleteWorkerProfile(userId);
            } else if (user.getRole().equals(UserRole.CITIZEN)) {
                citizenRepository.deleteByUserId(userId);
            }
        } catch (Exception e) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Failed to delete user profile from dependent service: " + e.getMessage());
            response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }

        userRepository.deleteUserById(userId);

        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("User Deleted Successfully");
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }


    @Override
    public CommonResponse logout(String token) {
        CommonResponse response = new CommonResponse();
        try {
            Date expiry = jwtService.extractExpiration(token);

            BlacklistedToken blacklistedToken = new BlacklistedToken();
            blacklistedToken.setToken(token);
            blacklistedToken.setExpiryDate(expiry);

            blacklistedTokenRepository.save(blacklistedToken);

            response.setStatus(HttpStatus.OK);
            response.setStatusCode(HttpStatus.OK.value());
            response.setResponseStatus(ResponseStatus.SUCCESS);
            response.setMessage("Logout successful. Token invalidated.");
        } catch (Exception e) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Logout failed: " + e.getMessage());
        }
        return response;
    }

    private void validateRegistrationRequest(UserRequest request) {
        if (request.getName() == null || request.getName().isBlank()) throw new IllegalArgumentException("Name is required");
        if (request.getEmail() == null || request.getEmail().isBlank()) throw new IllegalArgumentException("Email is required");
        if (request.getPassword() == null || request.getPassword().isBlank()) throw new IllegalArgumentException("Password is required");
        if (request.getRole() == null) throw new IllegalArgumentException("Role is required");

        switch (request.getRole()) {
            case CITIZEN:
                if (request.getCity() == null) {
                    throw new IllegalArgumentException("City is required for CITIZEN role.");
                } else if (request.getAddress() == null) {
                    throw new IllegalArgumentException("Address is required for CITIZEN role.");
                } else if (request.getPhoneNumber() == null) {
                    throw new IllegalArgumentException("Phone Number is required for CITIZEN role.");
                } else if(request.getPinCode() == 0) {
                    throw new IllegalArgumentException("Pin code is required for CITIZEN role.");
                }
            break;
            case WORKER:
                if (request.getPhoneNumber() == null || request.getPhoneNumber().isBlank() || request.getSpecialization() == null || request.getSpecialization().isBlank()) {
                    throw new IllegalArgumentException("PhoneNumber and Specialization are required for WORKER role.");
                }
                break;
        }
    }

    private void validateUpdateRequest(UserRequest request) {
        if (request.getName() == null || request.getName().isBlank()) throw new IllegalArgumentException("Name is required");
        if (request.getRole() == null) throw new IllegalArgumentException("Role is required");

        switch (request.getRole()) {
            case CITIZEN:
                if (request.getCity() == null) {
                    throw new IllegalArgumentException("City is required for CITIZEN role.");
                } else if (request.getAddress() == null) {
                    throw new IllegalArgumentException("Address is required for CITIZEN role.");
                } else if (request.getPhoneNumber() == null) {
                    throw new IllegalArgumentException("Phone Number is required for CITIZEN role.");
                } else if(request.getPinCode() == 0) {
                    throw new IllegalArgumentException("Pin code is required for CITIZEN role.");
                }
                break;
            case WORKER:
                if (request.getPhoneNumber() == null || request.getPhoneNumber().isBlank() || request.getSpecialization() == null || request.getSpecialization().isBlank()) {
                    throw new IllegalArgumentException("PhoneNumber and Specialization are required for WORKER role.");
                }
                break;
        }
    }

    private User toEntity(UserRequest userRequest){
        User user = new User();
        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setRole(userRequest.getRole());
        return user;
    }

    private UserResponse toDTO(User user){
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setName(user.getName());
        userResponse.setEmail(user.getEmail());
        userResponse.setRole(user.getRole().name());
        userResponse.setCreatedOn(user.getCreatedOn());
        userResponse.setUpdateOn(user.getUpdatedOn());
        return userResponse;
    }

    private CitizenResponse toCitizenDTO(Citizen citizen){
        CitizenResponse citizenResponse = new CitizenResponse();
        User user = userRepository.getUserById(citizen.getUserId());
        citizenResponse.setUserId(citizen.getId());
        citizenResponse.setName(user.getName());
        citizenResponse.setEmail(user.getEmail());
        citizenResponse.setRole(user.getRole().name());
        citizenResponse.setPhoneNumber(citizen.getPhoneNumber());
        citizenResponse.setAddress(citizen.getAddress());
        citizenResponse.setCity(citizen.getCity());
        citizenResponse.setPinCode(citizen.getPinCode());
        citizenResponse.setCreatedOn(user.getCreatedOn());
        citizenResponse.setUpdateOn(user.getUpdatedOn());
        return citizenResponse;
    }
}