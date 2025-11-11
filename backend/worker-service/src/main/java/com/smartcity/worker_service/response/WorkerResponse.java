package com.smartcity.worker_service.response;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class WorkerResponse {
    private String workerId;
    private String name;
    private String email;
    private String phoneNumber;
    private String specialization;
    private boolean isAvailable;
    private int totalCredits;
    private List<String> assignedComplaints;
    private Date createdOn;
    private Date updateOn;
}