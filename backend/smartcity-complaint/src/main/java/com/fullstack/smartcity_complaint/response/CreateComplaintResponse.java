package com.fullstack.smartcity_complaint.response;

import lombok.Data;

import java.util.Date;

@Data
public class CreateComplaintResponse {
    private String id;
    private String userId;
    private String imageBase64;
    private String title;
    private String description;
    private String status;
    private Date createOn;
}
