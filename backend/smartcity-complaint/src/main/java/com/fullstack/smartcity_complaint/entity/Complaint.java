package com.fullstack.smartcity_complaint.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document
public class Complaint {
    @Id
    private String id;
    private String userId;
    private String imageBase64;
    private String title;
    private String description;
    private String status;
    private Date createdOn;
}
