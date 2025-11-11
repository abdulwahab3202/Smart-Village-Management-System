package com.fullstack.smartcity.user_service.request;

import lombok.Data;

@Data
public class WorkerRequest {
    private String userId;
    private String name;
    private String email;
    private String phoneNumber;
    private String specialization;
}