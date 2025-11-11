package com.fullstack.smartcity_complaint.request;

import lombok.Data;

@Data
public class UpdateComplaintRequest {
    private String title;
    private String description;
}