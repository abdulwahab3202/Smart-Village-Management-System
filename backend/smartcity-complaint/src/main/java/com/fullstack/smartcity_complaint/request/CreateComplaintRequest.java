package com.fullstack.smartcity_complaint.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateComplaintRequest {
    private String title;
    private String description;
    private String workerCategory;
    private MultipartFile image;
}