package com.smartcity.worker_service.request;
import lombok.Data;

@Data
public class WorkAssignmentRequest {
    private String workerId;
    private String complaintId;
    private int creditPoints;
}
