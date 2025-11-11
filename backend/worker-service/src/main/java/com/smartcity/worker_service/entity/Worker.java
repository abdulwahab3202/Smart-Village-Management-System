package com.smartcity.worker_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "workers")
public class Worker {
    @Id
    private String workerId;
    private String name;
    private String email;
    private String phoneNumber;
    private String specialization;
    private boolean isAvailable;
    private int totalCredits;
    private Date createdOn;
    private Date updatedOn;
    private List<String> assignedComplaints = new ArrayList<>();
}